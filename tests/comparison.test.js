import test from 'node:test';
import assert from 'node:assert/strict';
import { DefaultLinesDiffComputer } from '../client/node_modules/monaco-editor/esm/vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer.js';
import { comparisonOptions } from '../client/src/studio/comparisonOptions.js';

test('review highlights indentation-only changes that alter Python control flow', () => {
  const original = ['if ready:', '    launch()', 'log()'];
  const modified = ['if ready:', '    launch()', '    log()'];
  const options = {
    ignoreTrimWhitespace: true, // Monaco's editor default.
    maxComputationTimeMs: 5000,
    computeMoves: false,
    ...comparisonOptions,
  };
  const diff = new DefaultLinesDiffComputer().computeDiff(original, modified, options);
  assert.equal(diff.changes.length, 1, 'the review must display the indentation change');
  assert.equal(diff.changes[0].modified.startLineNumber, 3);
});
