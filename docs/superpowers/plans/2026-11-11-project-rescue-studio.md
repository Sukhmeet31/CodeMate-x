# Project Rescue Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a useful local Project Rescue Studio with real imports, evidence-based missions, saved editing, and optional AI assistance.

**Architecture:** Retain React/Vite and Express. Share portable assessment/validation between server and browser; keep projects in IndexedDB. Use controlled HTTP adapters for GitHub/Gemini and never execute imported code.

**Tech Stack:** JavaScript ESM, React 19, Vite, Monaco, Express 5, Node test runner, IndexedDB.

**Spec:** `docs/superpowers/specs/2026-11-11-project-rescue-studio-design.md`

## Global Constraints

- Do not add AI authorship or co-author trailers. No publishing, GitHub writes, or merges.
- Maximum 120 included source files, 128 KiB per file, 3 MiB total source text.
- Static assessment never claims to run builds/tests. User-marked completion stays distinct from verification.
- AI context is selected file up to 20,000 characters plus selected mission and user message; server-only keys.
- Work on `codex/project-rescue-studio` in the restored checkout. Implement inline; get a fresh final review.

## Review Focus

- Storage failure and multiple open tabs must not silently lose edits.
- Import boundaries must reject hostile paths/URLs and exclude secrets before persistence or transmission.
- GitHub partial/truncated/failing fetches must not produce a supposedly complete assessment.
- Backup validation and repeat scans must preserve valid progress without stale findings.
- Mobile/dialog keyboard access and missing AI/server states must remain usable.

## Task 1: Project model and honest assessment

**Files:** `shared/project.js`, `tests/project.test.js`, root `package.json`.
**Produces:** `normalizeFiles(files)`, `analyzeProject(files)`, `createProject({name, files, source})`, `rescanProject(project)`, `validateBackup(value)`, `progress(project)`.

- [x] Write tests for source filtering, traversal/duplicates, limits, invalid manifests, evidenced findings, stable mission IDs, status preservation, and hostile backups.
- [x] Run `node --test tests/project.test.js`; confirm feature-missing failures.
- [x] Implement the shared model and deterministic scan. Test real fixture inputs.
- [x] Run the suite and record the result.

## Task 2: Import and assistant API

**Files:** `server/github.js`, `server/app.js`, `server/server.js`, `tests/api.test.js`, `server/.env.example`.
**Consumes:** Task 1 project creation.
**Produces:** `importGithub(input, {fetchImpl})`, `createApp({fetchImpl, apiKey, model})`; POST `/api/import/github`, POST `/api/chat`, GET `/api/health`.

- [x] Write tests using real HTTP against the app and controlled upstream fetch responses: URL restrictions, GitHub default branch content, rate limits, failures, missing key, validation, timeout, origins, provider content extraction.
- [x] Run test suite and see failures before implementation.
- [x] Implement bounded adapters and routes. Add loopback startup, same-origin Vite proxy, clear API errors, and environment example.
- [x] Run suite and verify live public repository import separately.

## Task 3: Studio interface and persistence

**Files:** `client/src/studio/*`, `client/src/App.jsx`, `client/src/main.jsx`, `client/src/index.css`, `client/index.html`, `client/vite.config.js`.
**Consumes:** Project model and APIs. **Produces:** Complete import → overview → mission → edit → save → restore flow.

- [x] Add storage tests using an IndexedDB test implementation for round trips, errors, and backup preservation; run red.
- [x] Implement IndexedDB persistence and a browser lock for one writer, with explicit save/error states.
- [x] Implement modern responsive shell, empty state, project cards, mission detail, bundled Monaco, assistant, activity, settings, import dialog, and sample fixture.
- [x] Connect every exposed action and remove legacy shell from active entrypoint.
- [x] Browser-check import/edit/reload/progress/export plus narrow layout and keyboard dialog behavior; fix observed failures.

## Task 4: Verification and handoff

**Files:** README, package scripts, tests as needed, this plan/progress notes.

- [x] Add root install/dev/build/test/lint commands and accurate setup/privacy/limitations documentation.
- [x] Run full tests, lint, production build; inspect actual API and browser outcomes.
- [x] Fresh reviewer checks the branch against the spec. Fix material findings with regression tests.
- [x] Leave reviewable local changes and report startup URL, what works, verification, and AI-key limitation. No co-author trailers.
