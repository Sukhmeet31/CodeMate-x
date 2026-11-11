import { createProject, isSourcePath, safePath, LIMITS } from '../shared/project.js';

export function parseRepository(input) {
  if (typeof input !== 'string')
    throw new Error('Enter a public GitHub repository URL or owner/name.');
  let value = input.trim();
  if (value.startsWith('https://')) {
    const url = new URL(value);
    if (
      url.hostname !== 'github.com' ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash
    )
      throw new Error('Use a public GitHub repository URL.');
    value = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  }
  value = value.replace(/\.git$/, '');
  if (
    !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value) ||
    ['.', '..'].includes(value.split('/')[1])
  )
    throw new Error('Use a GitHub repository URL or owner/name, without a branch or file path.');
  return value;
}

export async function readBounded(response, maxBytes) {
  if (Number(response.headers.get('content-length')) > maxBytes)
    throw new Error('The remote response is too large.');
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) throw new Error('The remote response is too large.');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}

export async function importGithub(input, { fetchImpl = fetch } = {}) {
  const repository = parseRepository(input);
  const base = `https://api.github.com/repos/${repository}`;
  const signal = AbortSignal.timeout(45000);
  async function api(path) {
    const response = await fetchImpl(base + path, {
      signal,
      redirect: 'error',
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'CodeMate-X-Rescue-Studio' },
    });
    if (response.status === 404)
      throw new Error('Repository not found. Use a public repository or import a local folder.');
    if (response.status === 403 || response.status === 429)
      throw new Error('GitHub rate limit reached. Try again later or import a local folder.');
    if (!response.ok) throw new Error('GitHub could not load this repository. Please try again.');
    return JSON.parse(await readBounded(response, 8 * 1024 * 1024));
  }
  const repo = await api('');
  if (typeof repo.default_branch !== 'string')
    throw new Error('This repository has no default branch.');
  const commit = await api(`/commits/${encodeURIComponent(repo.default_branch)}`);
  if (typeof commit.sha !== 'string' || !/^[a-f0-9]+$/i.test(commit.sha))
    throw new Error('GitHub returned an invalid commit.');
  const tree = await api(`/git/trees/${commit.sha}?recursive=1`);
  if (tree.truncated || !Array.isArray(tree.tree) || tree.tree.length > 20000)
    throw new Error(
      'This repository is too large for a complete scan. Import a smaller local folder.',
    );
  const all = tree.tree.filter((f) => f.type === 'blob');
  const candidates = all.filter(
    (f) =>
      isSourcePath(safePath(f.path)) &&
      Number.isFinite(f.size) &&
      f.size <= LIMITS.fileBytes &&
      f.mode !== '120000',
  );
  if (candidates.length > LIMITS.files)
    throw new Error(
      'This repository has more than 120 source files. Import a smaller local folder.',
    );
  if (candidates.reduce((sum, f) => sum + f.size, 0) > LIMITS.totalBytes)
    throw new Error('This repository exceeds 3 MiB of source. Import a smaller local folder.');
  const files = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(6, candidates.length) }, async () => {
      while (cursor < candidates.length) {
        const entry = candidates[cursor++];
        const path = entry.path.split('/').map(encodeURIComponent).join('/');
        const response = await fetchImpl(
          `https://raw.githubusercontent.com/${repository}/${commit.sha}/${path}`,
          { signal, redirect: 'error' },
        );
        if (!response.ok)
          throw new Error(
            `Could not load source file ${entry.path}. No project was imported; please retry.`,
          );
        files.push({ path: entry.path, content: await readBounded(response, LIMITS.fileBytes) });
      }
    }),
  );
  const project = createProject({
    name: repo.name || repository.split('/')[1],
    files,
    source: {
      type: 'github',
      repository,
      url: `https://github.com/${repository}`,
      branch: repo.default_branch,
      commit: commit.sha,
    },
  });
  project.excluded += all.length - candidates.length;
  return project;
}
