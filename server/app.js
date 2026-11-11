import express from 'express';
import { importGithub, parseRepository } from './github.js';
import { answerQuestion } from './assistant.js';

export function createApp({ fetchImpl = fetch, apiKey = '', model = 'gemini-2.5-flash' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && !['GET', 'HEAD'].includes(req.method)) {
      try {
        const o = new URL(origin);
        if (
          !['localhost', '127.0.0.1', '[::1]'].includes(o.hostname) ||
          !['http:', 'https:'].includes(o.protocol)
        )
          return res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
      } catch {
        return res.status(403).json({ error: 'Invalid request origin.' });
      }
    }
    next();
  });
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', aiConfigured: !!apiKey, model: apiKey ? model : null }),
  );
  app.post('/api/import/github', async (req, res, next) => {
    try {
      parseRepository(req.body?.repository);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    try {
      res.json({ project: await importGithub(req.body.repository, { fetchImpl }) });
    } catch (error) {
      next(error);
    }
  });
  app.post('/api/chat', async (req, res, next) => {
    try {
      const response = await answerQuestion(req.body, { fetchImpl, apiKey, model });
      res.status(response.status).json(await response.json());
    } catch (error) {
      next(error);
    }
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === 'entity.too.large')
      return res.status(413).json({ error: 'Request is too large.' });
    if (error instanceof SyntaxError && 'body' in error)
      return res.status(400).json({ error: 'Send a valid JSON request.' });
    const timeout = ['TimeoutError', 'AbortError'].includes(error.name);
    res.status(timeout ? 504 : 502).json({
      error: timeout
        ? 'The request timed out. Please retry.'
        : error.message === 'fetch failed'
          ? 'The remote service is unreachable. Check your connection and retry.'
          : error.message || 'The request failed. Please retry.',
    });
  });
  return app;
}
