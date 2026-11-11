import { build } from '../client/node_modules/vite/dist/node/index.js';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
await build({
  root: path.join(root, 'client'),
  configFile: path.join(root, 'client/vite.config.js'),
  build: { outDir: path.join(root, 'dist/client'), emptyOutDir: true },
});
await build({
  root,
  configFile: false,
  build: {
    ssr: path.join(root, 'server/worker.js'),
    outDir: path.join(root, 'dist/server'),
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'index.js' } },
  },
});
await mkdir(path.join(root, 'dist/.openai'), { recursive: true });
await copyFile(
  path.join(root, '.openai/hosting.json'),
  path.join(root, 'dist/.openai/hosting.json'),
);
await writeFile(
  path.join(root, 'dist/server/wrangler.json'),
  JSON.stringify(
    {
      name: 'codemate-x-rescue-studio',
      main: 'index.js',
      compatibility_date: '2026-11-01',
      assets: {
        directory: '../client',
        binding: 'ASSETS',
        not_found_handling: 'single-page-application',
        run_worker_first: ['/api/*'],
      },
    },
    null,
    2,
  ),
);
