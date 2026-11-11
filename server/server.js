import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)), quiet: true });
const port = Number(process.env.PORT || 5000);
const app = createApp({
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
});
app.listen(port, '127.0.0.1', () => console.log(`CodeMate-X API: http://127.0.0.1:${port}`));
