import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorker } from '../server/worker.js';

const origin = 'https://studio.example';
const request = (path, body, headers = {}) =>
  new Request(origin + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
    body: JSON.stringify(body),
  });

test('hosted API serves health and keeps AI optional without a runtime secret', async () => {
  const worker = createWorker();
  const health = await worker.fetch(new Request(origin + '/api/health'), {});
  assert.deepEqual(await health.json(), {
    status: 'ok',
    aiConfigured: false,
    model: null,
    hosted: true,
  });
  const response = await worker.fetch(request('/api/chat', { message: 'Help' }), {});
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /site owner/i);
});

test('hosted imports use the same bounded importer and accept only their own browser origin', async () => {
  const calls = [];
  const worker = createWorker({
    fetchImpl: async (url) => {
      calls.push(url);
      if (url.includes('raw.githubusercontent.com')) return new Response('# Demo');
      if (url.endsWith('/commits/main')) return Response.json({ sha: 'abc123' });
      if (url.includes('/git/trees/'))
        return Response.json({ tree: [{ type: 'blob', path: 'README.md', size: 6 }] });
      return Response.json({ name: 'demo', full_name: 'owner/demo', default_branch: 'main' });
    },
  });
  const denied = await worker.fetch(
    request(
      '/api/import/github',
      { repository: 'owner/demo' },
      { Origin: 'https://other.example' },
    ),
    {},
  );
  assert.equal(denied.status, 403);
  assert.equal(calls.length, 0);
  const imported = await worker.fetch(
    request('/api/import/github', { repository: 'owner/demo' }),
    {},
  );
  assert.equal(imported.status, 200);
  assert.equal((await imported.json()).project.files[0].content, '# Demo');
});

test('hosted API rejects malformed and oversized bodies before upstream calls', async () => {
  const worker = createWorker({
    fetchImpl: () => {
      throw new Error('Must not call upstream');
    },
  });
  assert.equal(
    (await worker.fetch(new Request(origin + '/api/chat', { method: 'POST', body: '{broken' }), {}))
      .status,
    400,
  );
  assert.equal(
    (await worker.fetch(request('/api/chat', { message: 'x'.repeat(103000) }), {})).status,
    413,
  );
  assert.equal(
    (
      await worker.fetch(
        request('/api/import/github', { repository: 'https://evil.example/a/b' }),
        {},
      )
    ).status,
    400,
  );
});

test('hosted UI requests delegate to static assets while unknown API routes stay JSON', async () => {
  const worker = createWorker();
  const env = {
    ASSETS: {
      fetch: async () =>
        new Response('<main>Studio</main>', { headers: { 'Content-Type': 'text/html' } }),
    },
  };
  assert.match(await (await worker.fetch(new Request(origin + '/'), env)).text(), /Studio/);
  const missing = await worker.fetch(new Request(origin + '/api/missing'), env);
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get('content-type'), /json/);
});
