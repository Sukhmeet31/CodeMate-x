# Rescue workflow release checks

## Automated verification

- `npm test`: 39 passed, 0 failed.
- `npm run lint`: passed.
- `npm run build`: passed for browser assets and hosted Worker. Existing Monaco large-chunk, Browserslist age and legacy Tailwind configuration warnings remain non-blocking.
- `git diff --check`: passed.

Coverage includes independent import snapshots, legacy workspace migration, baseline validation, restore/undo limits, preservation of other edits and notes, backup round trips, ZIP header/decompression verification, Unicode/CRLF/empty source files, report filename collisions, current script reporting, and literal Markdown text. A real Monaco diff-engine regression verifies that whitespace-only Python indentation changes are highlighted.

## Browser verification

- Existing saved fixture migrated to **Saved starting point**, keeping content and notes.
- Editing produced a modified marker and original/current comparison; cancelling restore kept changes.
- Restore cleared the change; undo restored it. Added empty source files were tracked; removal and undo worked.
- Downloaded ZIP was independently read using .NET ZIP support and matched the browser-exported current content exactly, including Unicode and CRLF.
- Downloaded Markdown report included provenance, missions, evidence and explicit not-run status.
- Workspace backup contained both baseline and edits; restoring it and reloading retained modified/added counts.
- A fresh local folder import used **Imported original**. An indentation-only Python edit was visibly highlighted in red/green.
- Second tab could export but could not restore; closing the first tab transferred editing access.
- At 390 × 844, review layout stacked correctly and document width equalled viewport content width (no horizontal overflow).
- Browser console reported no errors during the final local review.
- Settings was reachable at the normal 1265 × 712 viewport after the sidebar height fix.

## Independent review

Whole-branch reviewer checked the spec, source, tests and migration boundaries. Corrected both reported issues: Monaco ignoring trimmed whitespace and unescaped Markdown tildes. Both regression tests were observed failing before their fixes, then passed with the full suite.

## Scope

This release exports the supported source subset, not excluded assets, lockfiles, dependencies or Git history. It never executes imported programs or pushes visitors' edits to GitHub. Existing secret exclusions are not a general credential scanner. Public AI remains optional and unconfigured; cloud accounts and synchronization are not part of this increment.

The release reuses the existing public Site at https://codemate-x-rescue-studio.tigersheroff6.chatgpt.site. Exact publication commit and deployment state are recorded in Git and Sites release history.
