import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, validateBackup, LIMITS } from '../shared/project.js';
import { getChanges, restoreFile, putFile } from '../shared/changes.js';

const file = (path, content = '') => ({ path, content });
const make = () => createProject({ name: 'Rescue', files: [file('a.js', 'original'), file('b.js', 'keep')] });
const backup = (p) => ({ version: 1, projects: [p], activeProjectId: p.id });

test('imports keep independent originals and detect edits, added empty files and exact reversions', () => {
  const p = make();
  assert.equal(p.baseline.kind, 'import');
  p.files[0].content = 'edited';
  p.files.push(file('empty.js'));
  assert.equal(p.baseline.files[0].content, 'original');
  assert.deepEqual(getChanges(p).map(({path,status}) => ({path,status})), [
    {path:'a.js',status:'modified'}, {path:'empty.js',status:'added'},
  ]);
  p.files[0].content = 'original';
  assert.deepEqual(getChanges(p).map((f) => f.path), ['empty.js']);
});

test('legacy backup migration retains saved content, mission notes and truthful baseline provenance', () => {
  const p = make();
  delete p.baseline;
  p.files[0].content = 'previously edited';
  p.missions[0].note = 'Keep this note';
  p.missions[0].status = 'done';
  const migrated = validateBackup(backup(p)).projects[0];
  assert.equal(migrated.baseline.kind, 'saved');
  assert.equal(migrated.baseline.capturedAt, p.updatedAt);
  assert.equal(migrated.baseline.files[0].content, 'previously edited');
  assert.equal(migrated.missions[0].note, 'Keep this note');
  assert.equal(migrated.missions[0].status, 'done');
  assert.deepEqual(getChanges(migrated), []);
  migrated.files[0].content = 'next edit';
  assert.equal(migrated.baseline.files[0].content, 'previously edited');
});

test('restore and undo retain unrelated edits and mission progress; backups preserve comparisons', () => {
  let p = make();
  p = putFile(p, file('a.js', 'changed'));
  p = putFile(p, file('b.js', 'unrelated'));
  p = putFile(p, file('new.md', '# New'));
  p.missions[0].note = 'My next step';
  const restored = restoreFile(p, 'a.js');
  assert.equal(restored.files.find((f) => f.path === 'a.js').content, 'original');
  assert.equal(restored.files.find((f) => f.path === 'b.js').content, 'unrelated');
  assert.equal(restored.missions[0].note, 'My next step');
  const undone = putFile(restored, p.files.find((f) => f.path === 'a.js'));
  assert.equal(undone.files.find((f) => f.path === 'a.js').content, 'changed');
  assert.equal(restoreFile(p, 'new.md').files.some((f) => f.path === 'new.md'), false);
  const roundTrip = validateBackup(JSON.parse(JSON.stringify(backup(undone)))).projects[0];
  assert.deepEqual(getChanges(roundTrip), getChanges(undone));
  assert.deepEqual(roundTrip.baseline, undone.baseline);
});

test('backup rejects unsafe, oversized, absent or malformed baseline files', () => {
  for (const entry of [file('../evil.js'), file('.env','TOKEN=x'), file('key.js','-----BEGIN PRIVATE KEY-----'), file('a.js','a'.repeat(LIMITS.fileBytes+1)),file('missing.js')]) {
    const p = make(); p.baseline.files = [entry];
    assert.throws(() => validateBackup(backup(p)));
  }
  for (const baseline of [null, {}, {kind:'fake',files:make().files,capturedAt:new Date().toISOString()}]) {
    const p = make(); p.baseline = baseline;
    assert.throws(() => validateBackup(backup(p)));
  }
});

test('restore and undo reject excess size or excluded content without changing existing files', () => {
  const full = Array.from({length:24},(_,i) => file(`f${i}.js`, 'a'.repeat(LIMITS.fileBytes)));
  let p = createProject({name:'Full',files:full});
  p = putFile(p, file('f0.js',''));
  p = putFile(p, file('added.js','b'.repeat(LIMITS.fileBytes)));
  const before = JSON.stringify(p);
  assert.throws(() => restoreFile(p,'f0.js'), /3 MiB/);
  assert.throws(() => putFile(p,file('added.js','-----BEGIN PRIVATE KEY-----')), /excluded|unsupported/i);
  assert.throws(() => putFile(p,file('large.js','a'.repeat(LIMITS.fileBytes+1))), /excluded|unsupported/i);
  assert.equal(JSON.stringify(p), before);
});
