import test from 'node:test';
import assert from 'node:assert/strict';
import { importPublicProject } from '../client/src/studio/importProject.js';

test('public import falls back to the visitor connection only for a shared GitHub rate limit', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    assert.equal(options.headers?.['User-Agent'], undefined);
    calls.push(url);
    if (url.includes('raw.githubusercontent.com')) return new Response('# Demo');
    if (url.endsWith('/commits/main')) return Response.json({ sha: 'abc123' });
    if (url.includes('/git/trees/'))
      return Response.json({ tree: [{ type: 'blob', path: 'README.md', size: 6 }] });
    return Response.json({ name: 'demo', default_branch: 'main' });
  };
  const requestApi = async () => {
    throw new Error('GitHub rate limit reached. Try again later or import a local folder.');
  };
  const project = await importPublicProject('owner/demo', { requestApi, fetchImpl });
  assert.equal(project.files[0].content, '# Demo');
  assert.equal(calls.length, 4);
  await assert.rejects(
    importPublicProject('owner/demo', {
      requestApi: async () => {
        throw new Error('Repository not found');
      },
      fetchImpl,
    }),
    /not found/,
  );
  assert.equal(calls.length, 4);
});

test('successful server import is returned without making browser GitHub calls', async () => {
  const project = { id: 'server-result' };
  assert.equal(
    await importPublicProject('owner/demo', {
      requestApi: async () => ({ project }),
      fetchImpl: () => {
        throw new Error('Unexpected browser request');
      },
    }),
    project,
  );
});
