import { useRef, useState } from 'react';
import {
  Download,
  Upload,
  ShieldCheck,
  Sparkles,
  HardDrive,
  CheckCircle2,
  LoaderCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Dialog, Tag } from './ui';
import { download } from './api';
import { validateBackup } from '../../../shared/project.js';

export default function Settings({
  workspace,
  onRestore,
  onRemove,
  readOnly,
  health,
  onRefreshHealth,
  fontSize,
  setFontSize,
}) {
  const [removing, setRemoving] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [error, setError] = useState('');
  const input = useRef(null);
  async function restore(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    try {
      if (file.size > 768 * 1024 * 1024)
        throw new Error('Backup is too large. Choose a CodeMate-X workspace backup under 768 MiB.');
      setIncoming(validateBackup(JSON.parse(await file.text())));
    } catch (e) {
      setError(`Could not restore: ${e.message}`);
    }
  }
  return (
    <div className="page settings-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>
            Workspace settings<span className="heading-dot">.</span>
          </h1>
          <p>A few essentials for your next chapter.</p>
        </div>
        <Tag>LOCAL FIRST</Tag>
      </div>
      <div className="settings-grid">
        <section className="settings-card">
          <span className="settings-icon">
            <HardDrive size={22} />
          </span>
          <h2>Your workspace, backed up.</h2>
          <p>
            Projects and notes are stored in this browser’s IndexedDB. Clearing browser data removes
            them. Backups include original snapshots, edits and mission notes. Keep a backup to move
            to another browser or device.
          </p>
          <div className="settings-stat">
            <strong>{workspace.projects.length}</strong>
            <span>saved projects in this workspace</span>
          </div>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() =>
                download(
                  `codemate-workspace-${new Date().toISOString().slice(0, 10)}.json`,
                  JSON.stringify(workspace, null, 2),
                  'application/json',
                )
              }
            >
              <Download size={16} /> Export backup
            </button>
            <button
              className="button secondary"
              onClick={() => input.current.click()}
              disabled={readOnly}
            >
              <Upload size={16} /> Restore backup
            </button>
            <input
              ref={input}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={restore}
            />
          </div>
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}
        </section>
        <section className="settings-card">
          <span className="settings-icon">
            <Sparkles size={22} />
          </span>
          <div className="settings-title">
            <h2>A little extra help.</h2>
            <Tag tone={health?.aiConfigured ? 'green' : ''}>
              {health?.aiConfigured ? 'CONNECTED' : 'OPTIONAL'}
            </Tag>
          </div>
          <p>
            Connect Gemini to ask about your selected file and mission. Your code editor, imports,
            and rescue plan work without AI.
          </p>
          {health?.hosted ? (
            <p>
              AI is managed by the site owner. To enable it, the owner can add GEMINI_API_KEY and
              GEMINI_MODEL in the hosting environment, then redeploy. Visitors do not need to enter
              an API key.
            </p>
          ) : (
            <ol className="setup-steps">
              <li>
                Copy <code>server/.env.example</code> to <code>server/.env</code>.
              </li>
              <li>
                Add your key as <code>GEMINI_API_KEY</code>. Never put it in client code.
              </li>
              <li>
                Set <code>GEMINI_MODEL</code> to a model available to your account, then restart the
                server.
              </li>
            </ol>
          )}
          <div className="connection-row">
            <span>
              {health === null ? (
                <LoaderCircle size={15} />
              ) : health?.aiConfigured ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertTriangle size={15} />
              )}{' '}
              {health === null
                ? 'Checking…'
                : health?.aiConfigured
                  ? `Configured · ${health.model}`
                  : health?.offline
                    ? 'Project API is offline'
                    : 'API key not configured'}
            </span>
            <button
              className="icon-button"
              aria-label="Refresh AI connection"
              onClick={onRefreshHealth}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </section>
        <section className="settings-card">
          <span className="settings-icon">
            <ShieldCheck size={22} />
          </span>
          <h2>Know where your code goes.</h2>
          <p>
            Local folder imports stay in your browser. Public repositories are read through the
            application server, with a direct browser fallback if GitHub rate-limits the shared
            service. The assistant sends your question, selected mission, and up to 20,000
            characters of the selected file to Google Gemini only when you press Send.
          </p>
          <p>
            Known secret files and private-key content are excluded on import. Credentials embedded
            in normal code can remain: review your code before sending.
          </p>
          <span className="field-help">
            No automatic code execution, commits, or changes to your original repository.
          </span>
        </section>
        <section className="settings-card">
          <h2>Room to think.</h2>
          <p>Adjust the editor text size. This preference is saved with your browser workspace.</p>
          <label className="field-label" htmlFor="font-size">
            Editor font size <strong>{fontSize}px</strong>
          </label>
          <input
            id="font-size"
            type="range"
            min="12"
            max="20"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            disabled={readOnly}
          />
          <div className="font-preview" style={{ fontSize }}>
            <span>const</span> nextChapter = <em>'keep building';</em>
          </div>
          <p className="field-help">
            v0.2 · Source assessment does not execute build or test commands.
          </p>
        </section>
      </div>
      {workspace.projects.length > 0 && (
        <section className="settings-card manage-projects">
          <h2>Manage projects</h2>
          <p>
            Remove a browser copy to make room. Export a backup first to keep its edits and notes.
          </p>
          {workspace.projects.map((p) => (
            <div className="manage-project-row" key={p.id}>
              <span>{p.name}</span>
              <button
                className="icon-button"
                aria-label={`Remove ${p.name}`}
                onClick={() => setRemoving(p)}
                disabled={readOnly}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </section>
      )}
      {removing && (
        <Dialog title="Remove this browser copy?" onClose={() => setRemoving(null)}>
          <p className="dialog-intro">
            This removes {removing.name}, its edits, and mission notes from this workspace. Your
            original files and GitHub repository stay untouched. Export a backup first if you need
            these changes.
          </p>
          <div className="button-row">
            <button className="button secondary" onClick={() => setRemoving(null)}>
              Keep project
            </button>
            <button
              className="button primary"
              onClick={() => {
                onRemove(removing.id);
                setRemoving(null);
              }}
            >
              Remove project
            </button>
          </div>
        </Dialog>
      )}
      {incoming && (
        <Dialog title="Restore this workspace?" onClose={() => setIncoming(null)}>
          <p className="dialog-intro">
            This replaces your current {workspace.projects.length} projects with{' '}
            {incoming.projects.length} projects from the backup. Export your current workspace first
            if you want to keep it.
          </p>
          <div className="button-row">
            <button className="button secondary" onClick={() => setIncoming(null)}>
              Cancel
            </button>
            <button
              className="button primary"
              onClick={() => {
                onRestore(incoming);
                setIncoming(null);
              }}
            >
              Restore workspace
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
