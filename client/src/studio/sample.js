import { createProject } from '../../../shared/project.js';
export function sampleProject() {
  return createProject({
    name: 'Orbit — habit tracker',
    source: { type: 'sample' },
    files: [
      {
        path: 'README.md',
        content:
          '# Orbit\n\nA small habit tracker built with React and Vite.\n\n## Start\n\nnpm install\nnpm run dev\n\n## Current state\n\nThe interface renders habits, but they reset on refresh. Completing a habit still needs implementation.\n',
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'orbit',
            version: '0.1.0',
            type: 'module',
            scripts: { dev: 'vite', build: 'vite build' },
            dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
            devDependencies: { vite: '^7.0.0' },
          },
          null,
          2,
        ),
      },
      {
        path: 'src/App.jsx',
        content:
          "import { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  // TODO: persist habits between visits.\n  const [habits, setHabits] = useState([\n    { id: 1, name: 'Read for 20 minutes', done: false },\n    { id: 2, name: 'Go for a walk', done: false },\n  ]);\n\n  function completeHabit(id) {\n    // TODO: toggle the selected habit.\n  }\n\n  return (\n    <main className=\"app\">\n      <span className=\"eyebrow\">A LITTLE BETTER, EVERY DAY</span>\n      <h1>Your daily orbit.</h1>\n      {habits.map(habit => (\n        <button key={habit.id} onClick={() => completeHabit(habit.id)}>\n          {habit.done ? '✓ ' : '○ '}{habit.name}\n        </button>\n      ))}\n    </main>\n  );\n}\n",
      },
      {
        path: 'src/main.jsx',
        content:
          "import { createRoot } from 'react-dom/client';\nimport App from './App';\ncreateRoot(document.getElementById('root')).render(<App />);\n",
      },
      {
        path: 'src/styles.css',
        content:
          'body { margin: 0; background: #141719; color: #f3f0eb; font-family: system-ui; }\n.app { max-width: 640px; margin: 80px auto; padding: 24px; }\n.eyebrow { color: #e2ad74; font-size: 12px; letter-spacing: .15em; }\nbutton { display: block; padding: 16px; margin: 12px 0; width: 100%; text-align: left; }\n',
      },
      {
        path: 'index.html',
        content:
          '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><title>Orbit</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>',
      },
    ],
  });
}
