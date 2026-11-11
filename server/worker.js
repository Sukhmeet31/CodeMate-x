import { importGithub, parseRepository, readBounded } from './github.js';
import { answerQuestion } from './assistant.js';

export function createWorker({ fetchImpl = fetch } = {}) {
  return {
    async fetch(request, env = {}) {
      const url = new URL(request.url);
      if (!url.pathname.startsWith('/api/')) {
        return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
      }
      const fail = (status, error) =>
        Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
      const origin = request.headers.get('origin');
      if (!['GET', 'HEAD'].includes(request.method) && origin && origin !== url.origin)
        return fail(403, 'Cross-origin requests are not allowed.');
      const apiKey = env.GEMINI_API_KEY || '';
      const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
      if (request.method === 'GET' && url.pathname === '/api/health')
        return Response.json(
          { status: 'ok', aiConfigured: !!apiKey, model: apiKey ? model : null, hosted: true },
          { headers: { 'Cache-Control': 'no-store' } },
        );
      if (request.method !== 'POST' || !['/api/import/github', '/api/chat'].includes(url.pathname))
        return fail(404, 'Unknown API route.');
      let body;
      try {
        body = JSON.parse(await readBounded(request, 100 * 1024));
      } catch (error) {
        return fail(
          error instanceof SyntaxError ? 400 : 413,
          error instanceof SyntaxError ? 'Send a valid JSON request.' : 'Request is too large.',
        );
      }
      if (url.pathname === '/api/import/github') {
        try {
          parseRepository(body?.repository);
        } catch (error) {
          return fail(400, error.message);
        }
      }
      try {
        if (url.pathname === '/api/chat')
          return await answerQuestion(body, { fetchImpl, apiKey, model, hosted: true });
        return Response.json(
          { project: await importGithub(body.repository, { fetchImpl }) },
          { headers: { 'Cache-Control': 'no-store' } },
        );
      } catch (error) {
        const timeout = ['TimeoutError', 'AbortError'].includes(error.name);
        return fail(
          timeout ? 504 : 502,
          timeout
            ? 'The request timed out. Please retry.'
            : error.message === 'fetch failed'
              ? 'The remote service is unreachable. Please retry.'
              : error.message || 'The request failed. Please retry.',
        );
      }
    },
  };
}

export default createWorker();
