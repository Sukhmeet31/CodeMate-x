import test from 'node:test';
import assert from 'node:assert/strict';
import { inflateRawSync } from 'node:zlib';
import { createProject } from '../shared/project.js';
import { putFile } from '../shared/changes.js';
import { sourceArchive, rescueReport, exportName } from '../shared/export.js';

// Independent ZIP reader: inspect stored headers and decompress with Node zlib,
// not the library used to create the archive.
function readZip(bytes) {
  const data = Buffer.from(bytes);
  const files = new Map();
  let offset = 0;
  while (data.readUInt32LE(offset) === 0x04034b50) {
    const flags = data.readUInt16LE(offset + 6);
    assert.equal(flags & 8, 0, 'synchronous archive has explicit entry sizes');
    const method = data.readUInt16LE(offset + 8);
    const size = data.readUInt32LE(offset + 18);
    const nameLength = data.readUInt16LE(offset + 26);
    const extraLength = data.readUInt16LE(offset + 28);
    const name = data.subarray(offset + 30, offset + 30 + nameLength).toString('utf8');
    const start = offset + 30 + nameLength + extraLength;
    const compressed = data.subarray(start, start + size);
    const content = method === 0 ? compressed : inflateRawSync(compressed);
    assert.equal(content.length, data.readUInt32LE(offset + 22));
    assert.ok(!files.has(name));
    files.set(name, content.toString('utf8'));
    offset = start + size;
  }
  assert.equal(data.readUInt32LE(offset), 0x02014b50, 'central directory follows entries');
  assert.equal(data.readUInt32LE(data.length - 22), 0x06054b50, 'complete ZIP end record');
  assert.equal(data.readUInt16LE(data.length - 12), files.size);
  return files;
}

test('ZIP exports exact current source including Unicode, CRLF, empty files and report filename collisions', () => {
  let p = createProject({name:'../../My App', files:[
    {path:'src/हैलो.js',content:'const greeting = "🌱";\r\n'},
    {path:'empty.txt',content:''},
    {path:'RESCUE-REPORT.md',content:'# My own report'},
  ]});
  p = putFile(p,{path:'src/हैलो.js',content:'const greeting = "नमस्ते 🌱";\r\n'});
  const archive = sourceArchive(p);
  const entries = readZip(archive.bytes);
  const root = exportName(p.name);
  assert.match(archive.name,/^[a-z0-9-]+-source\.zip$/);
  assert.equal(entries.size,3);
  for(const f of p.files) assert.equal(entries.get(`${root}/${f.path}`), f.content);
  assert.ok([...entries.keys()].every((path) => !path.includes('..')));
});

test('export rejects unsafe or excluded source instead of silently making a partial ZIP', () => {
  for(const path of ['../unsafe.js','.env','key.js']) {
    const p = createProject({name:'Test',files:[{path:'a.js',content:''}]});
    p.files.push({path,content:'-----BEGIN PRIVATE KEY-----'});
    assert.throws(() => sourceArchive(p));
  }
  for(const name of ['', 'CON', '/../../', '项目 🌱']) assert.match(exportName(name),/^codemate-[a-z0-9-]+$/);
});

test('rescue report preserves notes, provenance and evidence, uses current scripts and does not claim execution', () => {
  let p = createProject({name:'<img src=x> [project]',files:[
    {path:'package.json',content:JSON.stringify({scripts:{test:'old command'}})},
    {path:'app.js',content:'// TODO: complete'},
  ],source:{type:'github',repository:'owner/repo',branch:'main',commit:'a'.repeat(40)}});
  p = putFile(p,{path:'package.json',content:JSON.stringify({scripts:{test:'node --test',build:'vite build'}})});
  const m = p.missions.find((mission) => mission.id === 'todo:app.js');
  m.status = 'in-progress'; m.note = 'Keep <script>literal</script>\n```md\n# not a heading';
  const report = rescueReport(p,'2026-11-12T01:00:00.000Z');
  assert.match(report,/2026-11-12T01:00:00.000Z/);
  assert.match(report,/a{40}/);
  assert.match(report,/in-progress/);
  assert.match(report,/app\\\.js:1/);
  assert.ok(report.includes('    Keep <script>literal</script>\n    ```md\n    # not a heading'));
  assert.ok(report.includes('&lt;img src=x&gt;'));
  assert.ok(report.includes('node --test'));
  assert.ok(!report.includes('old command'));
  assert.match(report,/Builds and tests were not run/);
  assert.match(report,/Imported original/);
  assert.match(report,/imported source subset/i);
  assert.match(report,/modified/);
});

test('legacy projects export without edits and report a saved starting point', () => {
  const p = createProject({name:'Legacy',files:[{path:'a.js',content:'already edited'}]});
  delete p.baseline;
  assert.equal(readZip(sourceArchive(p).bytes).size,1);
  assert.match(rescueReport(p),/Saved starting point/);
  assert.match(rescueReport(p),/No source changes/);
});
