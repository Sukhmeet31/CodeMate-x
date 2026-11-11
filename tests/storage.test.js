import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { createStorage } from '../client/src/studio/storage.js';
import { createProject, validateBackup } from '../shared/project.js';

test('IndexedDB persists the most recent edit and mission note across repository instances', async () => {
  const db = new IDBFactory();
  const storage = createStorage(db);
  assert.equal(await storage.load(), null);
  const project = createProject({ name: 'Test', files: [{ path: 'a.js', content: 'first' }] });
  const workspace = { version: 1, projects: [project], activeProjectId: project.id };
  const first = storage.save(workspace);
  const newer = structuredClone(workspace);
  newer.projects[0].files[0].content = 'second';
  newer.projects[0].missions[0].note = 'Make it durable';
  await Promise.all([first, storage.save(newer)]);
  const restored = await createStorage(db).load();
  assert.equal(restored.projects[0].files[0].content, 'second');
  assert.equal(restored.projects[0].missions[0].note, 'Make it durable');
});
test('failed database open is reported rather than treated as empty saved data', async () => {
  const storage = createStorage({
    open() {
      throw new Error('Storage blocked');
    },
  });
  await assert.rejects(storage.load(), /Storage blocked/);
  await assert.rejects(storage.save({ version: 1, projects: [] }), /Storage blocked/);
});
test('invalid backup validation leaves existing data untouched', async () => {
  const storage = createStorage(new IDBFactory());
  const old = { version: 1, projects: [], activeProjectId: null };
  await storage.save(old);
  assert.throws(() => validateBackup({ version: 2, projects: [] }), /backup/i);
  assert.deepEqual(await storage.load(), old);
});
