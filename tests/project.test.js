import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeFiles,
  analyzeProject,
  createProject,
  rescanProject,
  validateBackup,
  progress,
} from '../shared/project.js';

const file = (path, content = '') => ({ path, content });
test('excludes secret files, generated folders and private key content from imports', () => {
  const result = normalizeFiles([
    file('src/App.jsx', 'export default () => null'),
    file('.env', 'SECRET=x'),
    file('src/.env.local'),
    file('node_modules/x/a.js'),
    file('dist/main.js'),
    file('secret.pem'),
    file('src/key.js', '-----BEGIN PRIVATE KEY-----'),
    file('README.md', '# Hi'),
  ]);
  assert.deepEqual(
    result.files.map((f) => f.path),
    ['README.md', 'src/App.jsx'],
  );
  assert.equal(result.excluded, 6);
});
test('rejects traversal, absolute paths and duplicate files', () => {
  for (const path of ['../x.js', '/x.js', 'C:/x.js', 'src/../x.js'])
    assert.throws(() => normalizeFiles([file(path)]), /path/i);
  assert.throws(() => normalizeFiles([file('a.js'), file('a.js')]), /duplicate/i);
});
test('rejects empty, excessive or malformed source instead of creating misleading projects', () => {
  assert.throws(() => normalizeFiles([file('image.png')]), /source/i);
  assert.throws(
    () => normalizeFiles(Array.from({ length: 121 }, (_, i) => file(`a${i}.js`))),
    /120/,
  );
  assert.throws(() => normalizeFiles([{ path: 'a.js', content: 42 }]), /text/i);
  assert.throws(
    () =>
      normalizeFiles(
        Array.from({ length: 30 }, (_, i) => file(`a${i}.js`, 'a'.repeat(128 * 1024))),
      ),
    /3 MiB/,
  );
});
test('assessment distinguishes present test scripts from executed tests and cites TODO evidence', () => {
  const assessment = analyzeProject([
    file(
      'package.json',
      JSON.stringify({
        scripts: { test: 'node --test', build: 'vite build' },
        dependencies: { react: '19' },
      }),
    ),
    file('README.md', '# Hi'),
    file('src/app.js', 'const x = 1;\n// TODO: save this result'),
    file('tests/app.test.js', 'test()'),
  ]);
  assert.equal(assessment.stack.includes('React'), true);
  assert.equal(assessment.checks.find((c) => c.id === 'tests').found, true);
  assert.equal(
    assessment.missions.some((m) => m.id === 'missing-tests'),
    false,
  );
  assert.deepEqual(assessment.missions.find((m) => m.id === 'todo:src/app.js').evidence[0], {
    path: 'src/app.js',
    line: 2,
    detail: '// TODO: save this result',
  });
  assert.equal(assessment.verification, 'not-run');
});
test('invalid package manifest becomes an actionable finding', () => {
  const a = analyzeProject([file('client/package.json', '{broken')]);
  assert.ok(a.missions.find((m) => m.id === 'manifest:client/package.json'));
});
test('rescan preserves matching mission progress and removes resolved findings', () => {
  const p = createProject({ name: 'Todo', files: [file('app.js', '// TODO: persist')] });
  p.missions.find((m) => m.id === 'missing-tests').status = 'in-progress';
  p.missions.find((m) => m.id === 'missing-tests').note = 'Use node:test';
  p.files.push(file('README.md', '# added'));
  const next = rescanProject(p);
  assert.equal(next.missions.find((m) => m.id === 'missing-tests').note, 'Use node:test');
  assert.equal(next.missions.find((m) => m.id === 'missing-tests').status, 'in-progress');
  assert.equal(
    next.missions.some((m) => m.id === 'missing-readme'),
    false,
  );
  assert.equal(
    progress({ ...next, missions: next.missions.map((m) => ({ ...m, status: 'done' })) }).percent,
    100,
  );
});
test('backup roundtrips editable state but rejects invalid status, source, paths and duplicate IDs', () => {
  const p = createProject({ name: 'App', files: [file('src/a.js', 'let a=1')] });
  const backup = { version: 1, projects: [p], activeProjectId: p.id };
  assert.equal(
    validateBackup(JSON.parse(JSON.stringify(backup))).projects[0].files[0].content,
    'let a=1',
  );
  assert.throws(() => validateBackup({ ...backup, projects: [p, p] }), /duplicate/i);
  const broken = structuredClone(backup);
  broken.projects[0].missions[0].status = 'verified';
  assert.throws(() => validateBackup(broken), /mission/i);
  const badPath = structuredClone(backup);
  badPath.projects[0].files[0].path = '../a.js';
  assert.throws(() => validateBackup(badPath), /path/i);
  assert.throws(() => validateBackup({ version: 2, projects: [] }), /backup/i);
});
test('backup preserves historical missions, notes, source, activity and settings without silently rescanning', () => {
  const p = createProject({
    name: 'Sample',
    source: { type: 'sample' },
    files: [file('a.js', '// TODO: implement this')],
  });
  p.missions.find((m) => m.id === 'todo:a.js').status = 'done';
  p.missions.find((m) => m.id === 'todo:a.js').note = 'Implemented and manually checked.';
  p.files[0].content = 'export const working = true;';
  const backup = { version: 1, projects: [p], activeProjectId: p.id, settings: { fontSize: 18 } };
  const restored = validateBackup(JSON.parse(JSON.stringify(backup)));
  assert.deepEqual(restored.projects[0].missions, p.missions);
  assert.deepEqual(restored.projects[0].source, p.source);
  assert.deepEqual(restored.projects[0].activity, p.activity);
  assert.equal(restored.settings.fontSize, 18);
});
test('all common armored private-key headers are excluded even in ordinary text files', () => {
  for (const header of [
    '-----BEGIN PRIVATE KEY-----',
    '-----BEGIN RSA PRIVATE KEY-----',
    '-----BEGIN OPENSSH PRIVATE KEY-----',
    '-----BEGIN PGP PRIVATE KEY BLOCK-----',
  ]) {
    assert.deepEqual(
      normalizeFiles([
        file('src/a.js', 'const publicValue = 1;'),
        file('key.txt', header),
      ]).files.map((f) => f.path),
      ['src/a.js'],
    );
  }
});
test('assessment identifies explicitly unfinished screens with bounded source evidence', () => {
  const result = analyzeProject([
    file(
      'Projects.jsx',
      'export default () => <p>Create your first project once this screen is connected to real persistence.</p>;',
    ),
  ]);
  const finding = result.missions.find((m) => m.id === 'placeholder:Projects.jsx');
  assert.equal(finding.evidence[0].line, 1);
  assert.equal(finding.evidence[0].path, 'Projects.jsx');
});
