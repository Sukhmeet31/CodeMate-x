# CodeMate-X: Project Rescue Studio v1

## Intent and authorization

The user chose Project Rescue Studio and asked to build a modern, attractive first version. Proceed with reversible implementation decisions and keep them informed. Preserve the existing repository history. Do not add AI authorship or co-author trailers. No publishing, GitHub writes, or merges are part of this release.

The promise is **pick up where you left off**: bring a small unfinished project, see evidence of what needs attention, and work through saved missions.

## Approaches

The user selected Project Rescue Studio over Build & Learn Studio and Debug Arena. For delivery, use the existing React/Vite, Monaco, and Express stack. Browser-owned storage makes a useful first release possible without provisioning a database. Cloud accounts, execution environments, and autonomous repository modification add operational requirements and are deferred.

## First release

- Import a public GitHub repository by owner/name or canonical URL, using its default branch. Server requests go only to fixed GitHub API/raw hosts. No credentials are requested in the UI.
- Import a local folder directly in the browser. Exclude dependencies, Git internals, generated output, binary files, environment secrets, and key files. Imported files are copies, never edits to the original folder or remote repository.
- Provide an explicitly labeled sample project for exploration; never pretend it is user activity. Fresh workspaces start with an intentional empty state and a sample action.
- Store multiple projects, editable files, mission status, notes, and activity in IndexedDB. Report persistence failures; never show saved before the write succeeds. Keep a workspace JSON backup/export and restore flow. Individual source files can be downloaded.
- Analyze imported source deterministically: package manifests/scripts, README, tests, CI, environment documentation, TODO/FIXME markers, and placeholder implementation signals. Every finding cites file evidence or a clearly bounded absence. Assessments are static observations; builds and tests are **not run** by the product.
- Derive a prioritized rescue plan from findings. Users can select a mission, read its evidence/steps, add a note, and mark it in progress or done. Completion is explicitly user marked, not verified by an agent. A rerun refreshes findings and retains progress for stable mission IDs; obsolete missions disappear.
- Monaco supports editable imported files, language detection, search through file paths, and individual-file download. Track successful saves and project updates.
- Optional Gemini assistant receives only the user question, selected mission, and selected file (up to 20,000 characters, with disclosure). Explain, debug, and plan prompts are conveniences; responses are suggestions, never applied automatically. Missing key/offline/provider failures produce useful states. API keys remain server-side.
- Settings explain local storage and AI setup. No fake login, metrics, terminal, preview, or provider responses.

## Visual and interaction direction

A refined dark studio: charcoal backgrounds, warm off-white text, orange/coral primary actions, subtle grid lines, rounded panels, restrained motion, and crisp typography. Desktop has a persistent navigation rail, project overview, rescue plan, and workspace with files/editor/assistant. Tablet and mobile stack panels and provide accessible navigation. Prefer purposeful icons and code-derived project illustrations over decorative stock imagery.

Primary navigation: Overview, Rescue plan, Workspace, Activity, Settings. Overview shows actual imported projects, counts derived from saved state, and a next mission. Empty state explains the task and offers import/sample actions. Dialogs have labels, keyboard dismissal, focus management, and explicit cancel buttons. Respect reduced motion.

## Boundaries and failure behavior

- v1 prioritizes small JavaScript/React repositories but imports other supported text source files for editing.
- Maximum 120 included source files, 128 KiB per file, 3 MiB total source text. Unsupported/oversized files are reported as excluded; count/aggregate limits reject import rather than silently truncating the project. Display scan scope honestly.
- Known secret filenames and private-key content are excluded before storage or server calls. This is not a general credential scanner: credentials embedded in ordinary source may remain. The UI asks users to review selected code before AI transmission. Folder uploads do not leave the browser. AI transmission occurs only on an explicit send.
- Treat repository contents and AI responses as untrusted text. No HTML rendering, code execution, automatic commands, shell commands, or automatic patch application.
- GitHub import handles invalid URLs, missing/private repos, rate limits, timeouts, truncated trees, and raw content failures. Failure leaves existing projects untouched.
- Local Express listens on loopback by default, rejects cross-origin mutations, limits JSON bodies and upstream waits, and provides `/api/health`. It is a local development application, not a public multi-user service.
- Data changes in one browser tab should not silently overwrite another tab: enforce a single writable tab via a browser lock where supported and make other tabs read-only.
- Restored backup data is validated using the same import boundaries; malformed data cannot replace the workspace.

## Architecture

`shared/project.js`: portable ingestion validation, assessment, project creation, progress calculations.

`server/github.js`: bounded public GitHub fetch adapter. `server/app.js`: testable Express routes and Gemini REST adapter. `server/server.js`: environment configuration and loopback startup.

`client/src/studio/`: React shell, view components, dialogs, IndexedDB repository, API client, bundled Monaco workers, and CSS. `client/src/main.jsx` mounts the new studio without requiring Firebase. Existing legacy components remain in the tree for reference but are not in the active bundle.

## Acceptance

Import the actual CodeMate-X repository and inspect findings with paths. Import a local sample, edit a file, navigate/reload, and see persisted text. Change mission status and note, reload, export, and restore. Invalid import and blocked storage produce recoverable errors. Missing AI key produces an honest setup state. Test provider requests with controlled upstream responses; live AI validation requires a configured key. Build/lint/unit/API tests pass and browser QA covers desktop and narrow layouts.

## Builder decisions

The builder chooses component decomposition, exact visual spacing/type, sorting, deterministic scan rules, and concise product copy. Keep scope to the above; record substantive limitations in README and release notes.
