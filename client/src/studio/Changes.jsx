import { lazy, Suspense, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCheck,
  Download,
  FileArchive,
  FileCode2,
  FileText,
  GitCompareArrows,
  LoaderCircle,
  RotateCcw,
  Undo2,
} from 'lucide-react';
import { getChanges, restoreFile, putFile } from '../../../shared/changes.js';
import { exportName, rescueReport, sourceArchive } from '../../../shared/export.js';
import { download, timeLabel } from './api';
import { Dialog, Empty, Tag } from './ui';
import './changes.css';

const Comparison = lazy(() => import('./CodeEditor').then((m) => ({ default: m.CodeComparison })));

export default function Changes({ project, onChange, onWorkspace, onImport, readOnly, fontSize }) {
  const [selected, setSelected] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [undo, setUndo] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [exporting, setExporting] = useState('');
  if (!project)
    return (
      <div className="page">
        <Empty
          icon={GitCompareArrows}
          title="Make your next chapter portable"
          action={
            <button className="button primary" onClick={onImport} disabled={readOnly}>
              Import project <ArrowRight size={16} />
            </button>
          }
        >
          Import a project to review edits, recover files, and take your work with you.
        </Empty>
      </div>
    );
  const changes = getChanges(project);
  const change = changes.find((f) => f.path === selected) || changes[0];
  const modified = changes.filter((f) => f.status === 'modified').length;
  const added = changes.length - modified;
  const original = project.baseline?.kind === 'import';
  const baselineLabel = original ? 'Imported original' : 'Saved starting point';

  function restore() {
    if (readOnly) return;
    try {
      const before = project.files.find((f) => f.path === confirm.path);
      const next = restoreFile(project, confirm.path);
      onChange(
        () => next,
        `${confirm.status === 'added' ? 'Removed added file' : 'Restored'} ${confirm.path}`,
      );
      setUndo(before);
      setNotice(
        `${confirm.path} ${confirm.status === 'added' ? 'removed' : 'restored'}. Undo is available until you leave this screen.`,
      );
      setConfirm(null);
      setError('');
    } catch (e) {
      setConfirm(null);
      setError(e.message);
    }
  }
  function undoRestore() {
    if (readOnly || !undo) return;
    try {
      const next = putFile(project, undo);
      onChange(() => next, `Undid restoration of ${undo.path}`);
      setSelected(undo.path);
      setNotice(`Restoration undone for ${undo.path}.`);
      setUndo(null);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  async function exportProject(kind) {
    setExporting(kind);
    setError('');
    setNotice('');
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      if (kind === 'source') {
        const archive = sourceArchive(project);
        download(archive.name, archive.bytes, 'application/zip');
      } else {
        download(
          `${exportName(project.name)}-rescue-report.md`,
          rescueReport(project),
          'text/markdown;charset=utf-8',
        );
      }
      setNotice(
        `${kind === 'source' ? 'Source ZIP' : 'Rescue report'} download started. Your workspace stays saved here.`,
      );
    } catch (e) {
      setError(`Could not export: ${e.message}`);
    } finally {
      setExporting('');
    }
  }

  return (
    <div className="page changes-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">FROM UNFINISHED TO IN YOUR HANDS</span>
          <h1>
            Make it yours<span className="heading-dot">.</span>
          </h1>
          <p>Review your progress. Recover a file. Take the next version with you.</p>
        </div>
        <button className="button secondary" onClick={() => onWorkspace(change?.path)}>
          <FileCode2 size={16} /> Back to editor
        </button>
      </div>

      <section className="change-summary" aria-label="Change summary">
        <div className="change-project">
          <span className="change-symbol">
            <GitCompareArrows size={24} />
          </span>
          <div>
            <h2>{project.name}</h2>
            <p>
              {baselineLabel} · {timeLabel(project.baseline?.capturedAt || project.updatedAt)}
            </p>
          </div>
        </div>
        <div className="change-stat">
          <strong>{modified}</strong>
          <span>modified</span>
        </div>
        <div className="change-stat">
          <strong>{added}</strong>
          <span>added</span>
        </div>
        <div className="change-stat">
          <strong>{project.files.length}</strong>
          <span>source files</span>
        </div>
      </section>
      {!original && (
        <p className="baseline-note">
          This project was saved before change history was available. Comparisons start from that
          saved copy; earlier originals cannot be recovered here.
        </p>
      )}
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      {(notice || undo) && (
        <div className="change-notice" role="status">
          <span>{notice}</span>
          {undo && (
            <button className="button secondary compact" onClick={undoRestore} disabled={readOnly}>
              <Undo2 size={14} /> Undo restore
            </button>
          )}
        </div>
      )}

      {changes.length ? (
        <section className="change-review" aria-label="Review source changes">
          <aside className="change-files">
            <div className="panel-heading">
              <span>Changed files</span>
              <Tag>{changes.length}</Tag>
            </div>
            <div className="change-file-list">
              {changes.map((f) => (
                <button
                  key={f.path}
                  aria-pressed={f.path === change.path}
                  className={f.path === change.path ? 'active' : ''}
                  onClick={() => setSelected(f.path)}
                  title={f.path}
                >
                  <span className={`change-marker ${f.status}`} aria-label={f.status}>
                    {f.status === 'added' ? 'A' : 'M'}
                  </span>
                  <span>{f.path}</span>
                </button>
              ))}
            </div>
            <p>Changes stay in this browser until you download them.</p>
          </aside>
          <div className="change-diff">
            <div className="change-diff-heading">
              <span title={change.path}>
                <FileCode2 size={15} />
                {change.path}
              </span>
              <div>
                <button
                  className="button secondary compact"
                  onClick={() => onWorkspace(change.path)}
                >
                  Edit file <ArrowUpRight size={14} />
                </button>
                <button
                  className="button secondary compact"
                  onClick={() => setConfirm(change)}
                  disabled={readOnly}
                >
                  <RotateCcw size={14} />{' '}
                  {change.status === 'added' ? 'Remove added file' : 'Restore file'}
                </button>
              </div>
            </div>
            <div className="diff-legend">
              <span>
                <i className="removed-swatch" /> {baselineLabel}
              </span>
              <span>
                <i className="added-swatch" /> Your current version
              </span>
              <Tag>READ ONLY</Tag>
            </div>
            {change.status === 'added' && !change.current && (
              <p className="empty-file-note">
                New empty file — it will be included in your source ZIP.
              </p>
            )}
            <div className="comparison-container">
              <Suspense
                fallback={
                  <div className="editor-loading">
                    <LoaderCircle size={18} className="spin" /> Loading comparison…
                  </div>
                }
              >
                <Comparison
                  key={change.path}
                  change={change}
                  projectId={project.id}
                  fontSize={fontSize}
                />
              </Suspense>
            </div>
          </div>
        </section>
      ) : (
        <section className="changes-clean">
          <span className="clean-symbol">
            <CheckCheck size={30} />
          </span>
          <div>
            <h2>A fresh starting point.</h2>
            <p>
              No source changes to review yet. Open the editor to make your first improvement, or
              download the current source below.
            </p>
          </div>
          <button className="button secondary" onClick={() => onWorkspace()}>
            Open editor <ArrowRight size={16} />
          </button>
        </section>
      )}

      <div className="export-heading">
        <span className="eyebrow">READY FOR THE NEXT STEP</span>
        <h2>Your work goes with you.</h2>
      </div>
      <div className="export-grid">
        <section className="export-card source-export">
          <span className="export-icon">
            <FileArchive size={24} />
          </span>
          <div>
            <h3>Take the source.</h3>
            <p>
              All {project.files.length} current source files, including your edits and new files.
              Folder paths stay intact.
            </p>
          </div>
          <button
            className="button primary"
            disabled={!!exporting}
            onClick={() => exportProject('source')}
          >
            {exporting === 'source' ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Download size={16} />
            )}{' '}
            Download source ZIP
          </button>
          <small>Imported source subset · no GitHub changes</small>
        </section>
        <section className="export-card">
          <span className="export-icon">
            <FileText size={24} />
          </span>
          <div>
            <h3>Keep the context.</h3>
            <p>
              Your rescue missions, notes, source evidence and current scripts in a readable
              Markdown report.
            </p>
          </div>
          <button
            className="button secondary"
            disabled={!!exporting}
            onClick={() => exportProject('report')}
          >
            {exporting === 'report' ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Download size={16} />
            )}{' '}
            Download rescue report
          </button>
          <small>A handoff for your future self</small>
        </section>
      </div>
      <p className="export-scope">
        The ZIP contains supported files in this workspace. Excluded assets, lockfiles, dependencies
        and Git history are not included. Review source for embedded credentials before sharing.
        Builds and tests have not been run. For a restorable copy of projects and notes, use Export
        backup in Workspace settings.
      </p>
      {confirm && (
        <Dialog
          title={confirm.status === 'added' ? 'Remove this added file?' : 'Restore this file?'}
          onClose={() => setConfirm(null)}
        >
          <p className="restore-description">
            <strong>{confirm.path}</strong>
            {confirm.status === 'added'
              ? ' will be removed from this workspace because it was added after the starting point.'
              : ` will return to its ${original ? 'imported original' : 'saved starting point'}. Your current edits to this file will be replaced.`}
          </p>
          <p className="field-help">
            Other files and mission notes stay as they are. You can undo this action until you leave
            this screen.
          </p>
          <div className="button-row">
            <button className="button secondary" onClick={() => setConfirm(null)}>
              Keep my changes
            </button>
            <button className="button primary" onClick={restore} disabled={readOnly}>
              {confirm.status === 'added' ? 'Remove file' : 'Restore file'}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
