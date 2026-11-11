# Complete rescue workflow

The user approved building change review, restoring original files, source ZIP export, and a rescue report. Keep the existing charcoal/orange identity and public Site. Finish and publish this increment with GitHub main matching the deployed source; use only the user's existing Git identity.

## Experience

Add **Changes & export** to navigation, plus a Workspace shortcut with a changed-file count. The screen shows modified and added files, a read-only inline Monaco comparison (baseline versus current), an Edit file shortcut, and a per-file restore action. Empty state explains how to make the first change while keeping export available. On small screens the file list sits above the comparison.

Restoring a modified file resets its content to the baseline. Restoring an added file removes it. Confirm the affected filename and consequence before acting. Offer undo for the most recent restoration while the Changes screen remains open; validate undo against current project limits. Read-only tabs allow review/download but disable restore/undo.

## Data and safety

New imports capture a `baseline: {kind: 'import', capturedAt, files}` with independent file objects. Legacy projects without a baseline use their current saved content, labelled `Saved starting point`; do not claim recovery of a lost original. Retain existing version-1 workspace compatibility, mission notes, activity, source provenance, and settings. Validation returns a normalized migrated workspace, which the storage hook must actually use. Persist on the next ordinary edit.

Both current and baseline files independently retain the existing 120-file / 128-KiB-per-file / 3-MiB-source limits, path checks, and excluded-content rules. Baseline paths must exist in current files. No original-file deletion or renaming in this increment. Restore and undo must preserve all other edits and mission progress and enforce limits, even when a larger original would exceed the remaining total budget.

## Downloads

The ZIP contains only current supported workspace source at its relative paths, inside a safe project-name folder. Do not insert or overwrite a generated README/report in users' source. Use a maintained ZIP library for creation; do not add ZIP import. Validate before exporting. Preserve Unicode and line endings. The UI states this is the imported source subset: excluded assets, lockfiles, dependencies and Git history are absent. Existing exclusions cover known secret filenames and private-key blocks, not credentials embedded in otherwise supported source; remind people to review source before sharing. Do not redact exported content. Downloading does not update GitHub or prove the project runs.

A separate Markdown rescue report contains project name, generation time, import source and pinned commit when present, baseline provenance, changed files, source scope/exclusions, mission status/notes/evidence, and package scripts. Re-analyze current files for scripts in the report, but leave saved missions unchanged. Explicitly say builds/tests were not run. Render imported text as literal Markdown-safe text; no execution, external requests, or AI needed. Both downloads work with no edits.

Workspace JSON backup also preserves baselines and remains distinct from source ZIP. Use a generous bounded restore size that accommodates duplicated source snapshots; retain full nested validation.

## Validation and release

Test legacy migration, modified/added/unchanged detection, restore/undo boundaries, original isolation, backup round trips and malicious baselines. Independently read a generated ZIP and verify exact bytes, paths, empty files, Unicode, and report collisions. Exercise edit → review → restore → undo → export in the browser, reload persistence, and a narrow viewport. Run tests, lint, build, independent review, then merge/push and publish to the existing public Site. AI accounts, cloud synchronization and execution of imported code remain future work.

## Research

- GitHub's source-control workflow supports reviewing changes before carrying work back: https://docs.github.com/en/codespaces/developing-in-a-codespace/using-source-control-in-your-codespace
- Replit's checkpoint guidance supports a visible recovery point: https://replit.com/blog/doubling-down-on-our-commitment-to-secure-vibe-coding

Use these as interaction patterns; no integration with either service is introduced.
