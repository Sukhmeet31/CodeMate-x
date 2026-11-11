# Complete Rescue Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let people review, recover, and take their rescued source and mission notes out of the studio.

**Architecture:** Shared pure functions own snapshots, comparisons, restoration, and report generation. The React Changes screen composes these with the existing Monaco bundle and browser download helper. IndexedDB persists the same normalized workspace returned by backup validation.

**Tech Stack:** React 19, Monaco 0.54, Node test runner, fflate ZIP creation, existing Express/Worker hosting.

**Spec:** docs/superpowers/specs/2026-11-12-rescue-workflow-design.md

## Global Constraints

- Existing public Site and GitHub repository; no co-author trailers.
- 120 files / 128 KiB per file / 3 MiB per current or baseline snapshot.
- Legacy version-1 backups migrate without losing edits or notes; never invent original history.
- No execution of source, GitHub writes from the app, ZIP upload, paid AI or accounts.
- Keep source ZIP and rescue report separate to avoid collisions with user files.

## Review Focus

- A legacy edited project must compare against its saved starting point, not a fabricated original (Task 1).
- Restoring a larger original while near the project limit must fail safely (Task 1).
- A baseline carrying traversal, excluded keys, or missing paths must fail validation (Task 1).
- Unicode, CRLF, empty files and a user-owned RESCUE-REPORT.md must survive source export exactly (Task 2).
- Modified manifests and Markdown-like notes must produce a current, safe report without losing the user's text (Task 2).

### Task 1: Durable comparison and recovery

**Files:** shared/project.js; shared/changes.js; client/src/studio/useWorkspace.js; tests/changes.test.js; tests/storage.test.js.

**Interfaces:** `getChanges(project) -> [{path,status,original,current}]`; `restoreFile(project,path) -> Project`; `putFile(project,{path,content}) -> Project`; `validateBackup` returns migrated baseline data. New imports use baseline kind `import`, old workspaces `saved`.

- [ ] Add failing tests for independent import baseline, legacy migration preserving note/status, backup round trip, changed/added/reverted detection, restore/undo preserving unrelated edits, invalid baseline paths/content, and restore exceeding total size.
- [ ] Run `node --test tests/changes.test.js`; observe missing behavior failures.
- [ ] Implement functions and validation; use validated return on both storage-hook load paths. Enforce baseline inclusion and existing limits.
- [ ] Run `node --test tests/changes.test.js tests/project.test.js tests/storage.test.js`; expect all pass; commit.

### Task 2: Portable source and report

**Files:** shared/export.js; package.json/lock; tests/export.test.js; client/src/studio/Settings.jsx.

**Interfaces:** `sourceArchive(project) -> {name,bytes}`; `rescueReport(project,now?) -> string`; `exportName(name) -> safe string`; uses Task 1 comparison. ZIP contains source only under a safe project folder.

- [ ] Add failing tests for independent ZIP decoding (Node zlib reads ZIP entries), exact Unicode/CRLF/empty-file content, existing report filename preservation, source validation and safe root name. Test report current scripts, commit provenance, mission notes/evidence, literal escaped markup, and not-run status.
- [ ] Run `node --test tests/export.test.js`; observe missing module failure.
- [ ] Install pinned fflate 0.8.3 for archive creation only; implement export functions and bounded backup restore update. Escape inline Markdown and indent untrusted multiline notes/scripts as code.
- [ ] Run `node --test tests/export.test.js`; expect all pass; commit.

### Task 3: Review and download experience

**Files:** client/src/studio/Changes.jsx; CodeEditor.jsx; RescueStudio.jsx; Workspace.jsx; styles; README.md.

**Interfaces:** Changes receives project/onChange/onWorkspace/onImport/readOnly/fontSize. Reuse shared functions and lazy named Monaco comparison component. Workspace shortcut opens Changes; new navigation shows changed count.

- [ ] Add Changes screen, modified/added list, read-only inline comparison, export cards, honest scope/provenance labels, restore confirmation and session undo. Handle errors without changing saved content.
- [ ] Integrate navigation, workspace shortcut and changed-file markers; update version label and documentation.
- [ ] Run `npm test`, `npm run lint`, `npm run build`; expect all pass. In browser verify import/edit/review/cancel/restore/undo/download/reload and narrow layout, including read-only mode when available.
- [ ] Commit; obtain independent whole-branch review, address material findings with failing regression tests then full green suite.
- [ ] Merge to main, push, package the exact commit and publish existing public Site; verify URL and a production smoke test.
