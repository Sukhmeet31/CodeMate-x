# CodeMate-X — Project Rescue Studio

Give unfinished projects a fresh start. Import source code, find evidence-based next steps, and get back to building in a saved local workspace.

## Live site

[Open Project Rescue Studio](https://codemate-x-rescue-studio.tigersheroff6.chatgpt.site)

The public site keeps each visitor's projects in their own browser. The hosted API supports public GitHub imports. AI is optional and requires the site owner to configure a Gemini key; no key is included in this release.

## Run locally

Use Node.js 22.12 or newer and npm. From the repository root:

```sh
npm run setup
npm run dev
```

Open http://127.0.0.1:5173. The local Express API runs at http://127.0.0.1:5000; Vite proxies `/api` requests to it. Keep these ports available. Stop both processes with Ctrl+C.

## What works in v0.1

- Public GitHub repository import (default branch, pinned to the fetched commit) and local folder import.
- An explicitly labeled sample habit tracker to explore the workflow.
- Static source assessment: manifests/scripts, README, test files, CI, environment documentation, TODO/FIXME comments, and explicit placeholder screens, with file evidence.
- Prioritized rescue missions with notes, in-progress/completed states, and rescanning that retains matching progress.
- Monaco editor with bundled workers, file filtering, new files, and individual-file download.
- Up to 20 projects saved to browser IndexedDB, saved-state feedback, one writable browser tab, activity history, workspace JSON backup/restore, and removal of browser copies.
- Optional Gemini assistance for the selected file and mission, with explicit send and actionable errors.
- Responsive dark interface, keyboard-accessible native dialogs, and reduced-motion support.

## Optional AI setup

Copy `server/.env.example` to `server/.env`, add your `GEMINI_API_KEY`, and set `GEMINI_MODEL` to a generateContent model available to your account. Restart `npm run dev`, then use **Workspace settings → Refresh AI connection**.

Keys stay in the local server environment. A configured key is not proof of provider access; quota, model access, and credential validity are checked when a request is made. Without a key, importing, assessment, missions, editing, and backups still work. Live AI responses were not verified without credentials.

The server uses Google's REST generateContent endpoint; see the [official Gemini API reference](https://ai.google.dev/api/generate-content). Public import uses the [GitHub tree API](https://docs.github.com/en/rest/git/trees), with bounded raw-file downloads. GitHub's unauthenticated API rate limit may require waiting or importing a local folder instead.

## Data and boundaries

The studio runs locally with a loopback Express server or as a hosted Cloudflare Worker. Hosted visitors have separate browser workspaces; there is no shared project database. Firebase-based legacy screens remain in `client/src/components` for reference but are not loaded by the new studio. Cloud accounts, sync, and private GitHub authentication are future work.

Imported files are copies. Editing them never modifies your original folder or GitHub repository. Download a file to use its changes in your own checkout, or export a workspace backup to preserve the whole studio state. A workspace backup is JSON, not a runnable project archive.

Projects are stored in the browser for the specific origin (host + port). Clearing browser data removes them; another browser, host, or port has a separate workspace. Export backups regularly. Other tabs are read-only while one tab owns the workspace lock. Close the writable tab to transfer ownership. Browsers without the Web Locks API should use only one tab.

Imports allow up to 120 supported source files, 128 KiB each, and 3 MiB total. Dependencies, generated output, binaries, known secret filenames, and private-key content are excluded. Exclusion counts are displayed. Oversized source sets and truncated GitHub trees are rejected rather than silently treated as complete. Source support includes JavaScript/React, other common text code, and documentation; scanning is strongest for npm projects.

Secret filtering is not a general credential scanner. Credentials embedded in ordinary source can remain. Local folder imports stay in the browser. An explicit AI request sends the question, selected mission title, and up to 20,000 characters of the selected file through the application server to Google Gemini. Review the file before sending. AI suggestions are rendered as text and never automatically applied. The interface loads optional Google Fonts; system fonts are the fallback.

Assessment reports file evidence and bounded absence, not code correctness. Imported programs, build scripts, and tests are **never executed** by this release. Completing a mission is a user declaration; it is not an automated verification result. Commands listed in Workspace are reference text to review and run in your own checkout.

## Development checks

```sh
npm test
npm run lint
npm run build
```

The tests use Node's test runner, real HTTP requests to an ephemeral Express server, controlled external-service responses, and fake-indexeddb for persistence. No provider key is needed. The production build lazy-loads Monaco when opening the workspace; its language services produce large asset chunks.

`npm run build` produces `dist/client` and a Worker ES module in `dist/server/index.js`. The tracked `.openai/hosting.json` identifies the Sites deployment. `server/worker.js` exposes the same GitHub import and assistant logic as the local API, with request size limits and same-origin browser mutation checks. Runtime secrets belong in the host's environment, never source control. Before enabling a shared paid AI key on a public deployment, add visitor authentication and quota enforcement.

## Code map

- `shared/project.js`: source boundaries, deterministic assessment, mission progress, backup validation.
- `server/github.js`: public GitHub importer with time and size bounds.
- `server/app.js`: health, import, and optional assistant API.
- `server/worker.js`: hosted API and static asset routing.
- `server/assistant.js`: assistant logic shared by local and hosted APIs.
- `client/src/studio/`: active interface, browser storage, and editor.
- `tests/`: model, API, and storage regression coverage.
- `docs/superpowers/`: design, implementation plan, and verification record.
