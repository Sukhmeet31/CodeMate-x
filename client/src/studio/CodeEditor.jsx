import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import { useRef } from 'react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

globalThis.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new JsonWorker();
    if (['css', 'scss', 'less'].includes(label)) return new CssWorker();
    if (['html', 'handlebars', 'razor'].includes(label)) return new HtmlWorker();
    if (['typescript', 'javascript'].includes(label)) return new TsWorker();
    return new EditorWorker();
  },
};
loader.config({ monaco });
monaco.editor.defineTheme('rescue-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#141719',
    'editorLineNumber.foreground': '#50565c',
    'editorLineNumber.activeForeground': '#bfc4c7',
    'editor.selectionBackground': '#e59a5035',
    'editor.lineHighlightBackground': '#ffffff04',
    'editorCursor.foreground': '#e9a76c',
    'editorIndentGuide.background1': '#ffffff09',
  },
});

function fileLanguage(path) {
  const extension = path.split('.').pop();
  return (
    {
      js: 'javascript',
      jsx: 'javascript',
      mjs: 'javascript',
      cjs: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      css: 'css',
      scss: 'scss',
      html: 'html',
      md: 'markdown',
      py: 'python',
      yml: 'yaml',
      yaml: 'yaml',
      sql: 'sql',
      rs: 'rust',
      go: 'go',
      java: 'java',
      svg: 'xml',
    }[extension] || 'plaintext'
  );
}

export function CodeComparison({ change, projectId, fontSize }) {
  return (
    <DiffEditor
      height="100%"
      theme="rescue-dark"
      language={fileLanguage(change.path)}
      original={change.original}
      modified={change.current}
      originalModelPath={`baseline/${projectId}/${change.path}`}
      modifiedModelPath={`review/${projectId}/${change.path}`}
      loading={<div className="editor-loading">Opening comparison…</div>}
      options={{
        readOnly: true,
        originalEditable: false,
        renderSideBySide: false,
        renderOverviewRuler: false,
        automaticLayout: true,
        fontSize,
        wordWrap: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        hideUnchangedRegions: { enabled: true, contextLineCount: 3 },
      }}
    />
  );
}

export default function CodeEditor({ file, projectId, onChange, readOnly, fontSize }) {
  const editorRef = useRef(null);
  const language = fileLanguage(file.path);
  return (
    <Editor
      height="100%"
      theme="rescue-dark"
      path={`${projectId}/${file.path}`}
      language={language}
      value={file.content}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      onChange={(value) => {
        if (onChange(value ?? '') === false) {
          const model = editorRef.current?.getModel();
          if (model && model.getValue() !== file.content) model.setValue(file.content);
        }
      }}
      loading={<div className="editor-loading">Opening your editor…</div>}
      options={{
        fontSize,
        readOnly,
        minimap: { enabled: false },
        padding: { top: 20, bottom: 20 },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        fontFamily: "'Cascadia Code', 'Consolas', monospace",
        fontLigatures: true,
        lineNumbersMinChars: 3,
        renderLineHighlight: 'line',
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
      }}
    />
  );
}
