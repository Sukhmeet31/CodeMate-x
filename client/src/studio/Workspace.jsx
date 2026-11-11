import { lazy, Suspense, useState } from 'react';
import {
  FileCode2,
  Folder,
  Search,
  Download,
  Plus,
  Sparkles,
  Send,
  ArrowRight,
  LoaderCircle,
  ChevronRight,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { Empty, Dialog, Tag } from './ui';
import { request, download } from './api';
import { normalizeFiles, byteLength, LIMITS } from '../../../shared/project.js';
const CodeEditor = lazy(() => import('./CodeEditor'));

function Assistant({ file, mission, health, onSettings, readOnly }) {
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function ask(e) {
    e.preventDefault();
    if (!message.trim() || busy) return;
    setBusy(true);
    setError('');
    const context = file ? { path: file.path, content: file.content.slice(0, 20000) } : undefined;
    try {
      const result = await request('/api/chat', {
        message,
        file: context,
        mission: mission?.title,
      });
      setAnswer({ question: message, reply: result.reply, file: context?.path });
      setMessage('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside className="assistant-panel">
      <div className="panel-heading">
        <span>
          <Sparkles size={17} /> Rescue assistant
        </span>
        <span
          className={`status-light ${health?.aiConfigured ? 'on' : ''}`}
          title={health?.aiConfigured ? 'AI configured' : 'AI not connected'}
        />
      </div>
      <div className="assistant-body">
        {!answer ? (
          <>
            <div className="assistant-mark">
              <Sparkles size={26} />
            </div>
            <h3>A second pair of eyes.</h3>
            <p>
              Understand a tricky function, work through a bug, or break your next mission into
              smaller steps.
            </p>
            {!health?.aiConfigured && (
              <div className="assistant-setup">
                <strong>
                  {health === null ? 'Checking connection…' : 'Connect AI when you’re ready'}
                </strong>
                <p>
                  Your editor and rescue plan work on their own. Add a Gemini key to enable this
                  assistant.
                </p>
                <button className="text-link" onClick={onSettings}>
                  View setup <ArrowRight size={13} />
                </button>
              </div>
            )}
            <div className="suggestion-list">
              {[
                'Explain this file in plain English',
                'Help me approach this mission',
                'Review this file for likely bugs',
              ].map((s) => (
                <button key={s} onClick={() => setMessage(s)} disabled={readOnly}>
                  {s}
                  <ArrowUpRightIcon />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="question-bubble">{answer.question}</div>
            <span className="response-caption">
              <Sparkles size={13} /> Suggested next steps
            </span>
            <div className="assistant-response">{answer.reply}</div>
            <p className="field-help">
              Context: {answer.file || 'No file selected'}. Suggestions have not been applied or
              tested.
            </p>
            <button className="text-link" onClick={() => setAnswer(null)}>
              New question
            </button>
          </>
        )}
        {busy && (
          <div className="assistant-thinking" role="status">
            <LoaderCircle className="spin" size={17} /> Thinking through your code…
          </div>
        )}
        {error && (
          <div className="inline-error" role="alert">
            {error}
          </div>
        )}
      </div>
      <form className="assistant-compose" onSubmit={ask}>
        <div className="context-label">
          <FileCode2 size={12} />
          <span>{file?.path || 'No file selected'}</span>
        </div>
        <label className="visually-hidden" htmlFor="assistant-message">
          Message the rescue assistant
        </label>
        <textarea
          id="assistant-message"
          placeholder="Ask about your code…"
          value={message}
          maxLength={4000}
          onChange={(e) => setMessage(e.target.value)}
          disabled={busy || readOnly}
        />
        <div className="compose-bottom">
          <span>Selected file + mission only</span>
          <button
            className="send-button"
            type="submit"
            aria-label="Send to AI assistant"
            disabled={busy || readOnly || !message.trim()}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="ai-disclosure">
          Sending shares your question and selected code with Google Gemini. Review it for secrets.
          {file?.content.length > 20000 ? ' Only the first 20,000 characters are included.' : ''}
        </p>
      </form>
    </aside>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={13} />;
}

export default function Workspace({
  project,
  filePath,
  setFilePath,
  missionId,
  setMissionId,
  onChange,
  onImport,
  health,
  onSettings,
  readOnly,
  fontSize,
}) {
  const [query, setQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [newError, setNewError] = useState('');
  const [editError, setEditError] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  if (!project)
    return (
      <div className="page">
        <Empty
          icon={FileCode2}
          title="A workspace for your next chapter"
          action={
            <button className="button primary" onClick={onImport} disabled={readOnly}>
              Import project <ArrowRight size={16} />
            </button>
          }
        >
          Import a project to browse its files, make changes, and work with the assistant.
        </Empty>
      </div>
    );
  const file =
    project.files.find((f) => f.path === filePath) ||
    project.files.find((f) => /\.(jsx|tsx|js|ts)$/.test(f.path)) ||
    project.files[0];
  const files = project.files.filter((f) => f.path.toLowerCase().includes(query.toLowerCase()));
  const mission = project.missions.find((m) => m.id === missionId);
  function edit(content) {
    if (content === file.content) return true;
    if (byteLength(content) > LIMITS.fileBytes) {
      setEditError(
        'Edit rejected: files can contain up to 128 KiB. The editor has been restored to its previous contents.',
      );
      return false;
    }
    const next = project.files.map((f) => (f.path === file.path ? { ...f, content } : f));
    try {
      const checked = normalizeFiles(next);
      if (checked.files.length !== next.length)
        throw new Error('Private-key or binary content cannot be stored in this workspace.');
      setEditError('');
      onChange(
        (p) => ({
          ...p,
          files: p.files.map((f) => (f.path === file.path ? { ...f, content } : f)),
        }),
        `Edited ${file.path}`,
      );
      return true;
    } catch (e) {
      setEditError(
        `Edit rejected: ${e.message} The editor has been restored to its previous contents.`,
      );
      return false;
    }
  }
  function addFile(e) {
    e.preventDefault();
    try {
      const next = normalizeFiles([...project.files, { path: newPath.trim(), content: '' }]);
      if (next.files.length !== project.files.length + 1)
        throw new Error('Choose a supported source filename, such as src/example.js or README.md.');
      onChange((p) => ({ ...p, files: next.files }), `Created ${newPath.trim()}`);
      setFilePath(newPath.trim());
      setShowNew(false);
      setNewPath('');
      setNewError('');
    } catch (e) {
      setNewError(e.message);
    }
  }
  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">BACK TO BUILDING</span>
          <h1>
            {project.name}
            <span className="heading-dot">.</span>
          </h1>
        </div>
        <div className="workspace-tools">
          <Tag>LOCAL COPY</Tag>
          <button
            className="button secondary compact"
            onClick={() => setShowCommands(!showCommands)}
          >
            <Terminal size={15} /> Scripts
          </button>
        </div>
      </div>
      <div className="workspace-mission">
        <span>
          <FlagIcon /> Working on
        </span>
        <label className="visually-hidden" htmlFor="active-mission">
          Active mission
        </label>
        <select
          id="active-mission"
          value={missionId || ''}
          onChange={(e) => setMissionId(e.target.value)}
        >
          <option value="">Explore the project</option>
          {project.missions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        <span className="workspace-copy-note">
          <ShieldCheck size={14} /> Original files stay untouched
        </span>
      </div>
      {showCommands && (
        <div className="scripts-panel">
          <div>
            <strong>Commands found in package.json</strong>
            <button
              className="icon-button"
              aria-label="Close scripts"
              onClick={() => setShowCommands(false)}
            >
              <X size={16} />
            </button>
          </div>
          <p>
            Run these in your own local checkout after reviewing them. CodeMate-X does not execute
            imported code.
          </p>
          {project.assessment.commands.length ? (
            project.assessment.commands.map((c) => (
              <div className="script-row" key={`${c.path}:${c.name}`}>
                <span>{c.directory}</span>
                <code>npm run {c.name}</code>
                <small>{c.script}</small>
              </div>
            ))
          ) : (
            <p>No package scripts found in the latest scan.</p>
          )}
        </div>
      )}
      <div className="editor-grid">
        <aside className="file-panel">
          <div className="panel-heading">
            <span>
              <Folder size={15} /> Explorer
            </span>
            <button
              className="icon-button"
              aria-label="Create file"
              onClick={() => setShowNew(true)}
              disabled={readOnly}
            >
              <Plus size={16} />
            </button>
          </div>
          <label className="file-search">
            <Search size={13} />
            <input
              aria-label="Filter files"
              placeholder="Find a file…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="file-list">
            {files.map((f) => (
              <button
                title={f.path}
                key={f.path}
                className={f.path === file.path ? 'active' : ''}
                onClick={() => {
                  setFilePath(f.path);
                  setEditError('');
                }}
              >
                <FileCode2 size={14} />
                <span>{f.path}</span>
              </button>
            ))}
            {!files.length && <p className="field-help">No matching files.</p>}
          </div>
          <div className="file-panel-footer">{project.files.length} files · browser workspace</div>
        </aside>
        <section className="code-panel">
          <div className="editor-tab">
            <span>
              <FileCode2 size={15} />
              {file.path}
            </span>
            <button
              className="icon-button"
              aria-label="Download selected file"
              onClick={() => download(file.path.split('/').pop(), file.content)}
            >
              <Download size={16} />
            </button>
          </div>
          {editError && (
            <div className="inline-error" role="alert">
              {editError}
            </div>
          )}
          <div className="monaco-container">
            <Suspense
              fallback={
                <div className="editor-loading">
                  <LoaderCircle size={18} className="spin" /> Loading editor…
                </div>
              }
            >
              <CodeEditor
                file={file}
                projectId={project.id}
                onChange={edit}
                readOnly={readOnly}
                fontSize={fontSize}
              />
            </Suspense>
          </div>
          <div className="editor-status">
            <span>
              UTF-8 <span>·</span> {file.content.split('\n').length} lines
            </span>
            <span>Edits are saved in this browser</span>
          </div>
        </section>
        <Assistant
          key={project.id}
          file={file}
          mission={mission}
          health={health}
          onSettings={onSettings}
          readOnly={readOnly}
        />
      </div>
      {showNew && (
        <Dialog title="Create a source file" onClose={() => setShowNew(false)}>
          <form onSubmit={addFile}>
            <label className="field-label" htmlFor="new-path">
              File path
            </label>
            <input
              className="text-input"
              id="new-path"
              placeholder="src/example.js"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              autoFocus
              required
            />
            <p className="field-help">
              Creates a file in this browser workspace. Export it to use in your original project.
            </p>
            {newError && (
              <div className="inline-error" role="alert">
                {newError}
              </div>
            )}
            <button className="button primary full">
              Create file <Plus size={16} />
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
function FlagIcon() {
  return <ChevronRight size={15} />;
}
