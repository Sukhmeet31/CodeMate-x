import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { importGithub, parseRepository } from '../server/github.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fakeGithub = async (url) => {
  const u = new URL(url);
  if (u.hostname === 'raw.githubusercontent.com')
    return new Response(u.pathname.endsWith('package.json') ? '{}' : '# Example');
  if (u.pathname.endsWith('/commits/main')) return json({ sha: 'abc123' });
  if (u.pathname.endsWith('/git/trees/abc123'))
    return json({
      truncated: false,
      tree: [
        { type: 'blob', path: 'README.md', size: 9 },
        { type: 'blob', path: 'package.json', size: 2 },
        { type: 'blob', path: '.env', size: 100 },
      ],
    });
  return json({
    name: 'demo',
    full_name: 'owner/demo',
    default_branch: 'main',
    html_url: 'https://github.com/owner/demo',
  });
};
test('GitHub parser accepts repositories only and rejects arbitrary endpoints and credentials', () => {
  assert.equal(parseRepository('https://github.com/owner/demo.git'), 'owner/demo');
  assert.equal(parseRepository('owner/demo'), 'owner/demo');
  for (const input of [
    'https://evil.test/owner/repo',
    'https://github.com.evil.test/o/r',
    'https://a:b@github.com/o/r',
    'https://github.com/o/r/tree/main',
    '../../x',
    'http://127.0.0.1/private',
  ])
    assert.throws(() => parseRepository(input), /GitHub/i);
});
test('GitHub import resolves default branch to a commit and excludes secrets', async () => {
  const p = await importGithub('owner/demo', { fetchImpl: fakeGithub });
  assert.equal(p.source.commit, 'abc123');
  assert.deepEqual(
    p.files.map((f) => f.path),
    ['package.json', 'README.md'],
  );
  assert.equal(p.excluded, 1);
});
test('GitHub failures are actionable and never become partial projects', async () => {
  await assert.rejects(
    importGithub('o/r', { fetchImpl: async () => json({}, 403) }),
    /rate limit/i,
  );
  await assert.rejects(
    importGithub('o/r', {
      fetchImpl: async (url) =>
        String(url).includes('/git/trees/') ? json({ truncated: true, tree: [] }) : fakeGithub(url),
    }),
    /large/i,
  );
  await assert.rejects(
    importGithub('o/r', {
      fetchImpl: async (url) =>
        String(url).includes('raw.githubusercontent')
          ? new Response('', { status: 404 })
          : fakeGithub(url),
    }),
    /file/i,
  );
});
async function withApi(options, run) {
  const server = createApp(options).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(url);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
const post = (url, path, body, headers = {}) =>
  fetch(url + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
test('health reports unavailable AI and chat returns setup error without key', async () =>
  withApi({ apiKey: '' }, async (url) => {
    const health = await (await fetch(url + '/api/health')).json();
    assert.equal(health.aiConfigured, false);
    const response = await post(url, '/api/chat', { message: 'Help' });
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /GEMINI_API_KEY/);
  }));
test('routes validate input and reject cross-origin mutations', async () =>
  withApi({ apiKey: 'test' }, async (url) => {
    assert.equal((await post(url, '/api/chat', { message: 42 })).status, 400);
    assert.equal(
      (await post(url, '/api/chat', { message: 'x' }, { Origin: 'https://evil.test' })).status,
      403,
    );
    assert.equal(
      (await post(url, '/api/import/github', { repository: 'http://localhost/private' })).status,
      400,
    );
  }));
test('assistant sends selected context only and extracts text without leaking key', async () => {
  let payload;
  await withApi(
    {
      apiKey: 'test',
      model: 'gemini-2.5-flash',
      fetchImpl: async (url, options) => {
        assert.equal(new URL(url).hostname, 'generativelanguage.googleapis.com');
        payload = JSON.parse(options.body);
        return json({ candidates: [{ content: { parts: [{ text: 'Use a reducer.' }] } }] });
      },
    },
    async (url) => {
      const response = await post(url, '/api/chat', {
        message: 'How?',
        file: { path: 'a.js', content: 'const a = 1;' },
        mission: 'Persist state',
      });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).reply, 'Use a reducer.');
      assert.match(JSON.stringify(payload), /const a = 1/);
      assert.match(JSON.stringify(payload), /Persist state/);
    },
  );
});
test('provider failures and blank replies surface errors', async () => {
  await withApi({ apiKey: 'test', fetchImpl: async () => json({}, 429) }, async (url) => {
    assert.equal((await post(url, '/api/chat', { message: 'Help' })).status, 429);
  });
  await withApi(
    { apiKey: 'test', fetchImpl: async () => json({ candidates: [] }) },
    async (url) => {
      assert.equal((await post(url, '/api/chat', { message: 'Help' })).status, 502);
    },
  );
});
test('assistant rejects armored PGP private keys in ordinary source files', async () =>
  withApi(
    {
      apiKey: 'test',
      fetchImpl: async () =>
        json({ candidates: [{ content: { parts: [{ text: 'unexpected' }] } }] }),
    },
    async (url) => {
      const response = await post(url, '/api/chat', {
        message: 'Review',
        file: { path: 'key.txt', content: '-----BEGIN PGP PRIVATE KEY BLOCK-----' },
      });
      assert.equal(response.status, 400);
    },
  ));
