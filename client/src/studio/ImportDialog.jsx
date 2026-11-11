import { useState } from 'react';
import { Github, FolderUp, ArrowRight, LockKeyhole, LoaderCircle } from 'lucide-react';
import { Dialog } from './ui';
import { importPublicProject } from './importProject';
import { createProject, isSourcePath, LIMITS } from '../../../shared/project.js';

export default function ImportDialog({ onClose, onImport }) {
  const [mode, setMode] = useState('github');
  const [repository, setRepository] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function github(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const project = await importPublicProject(repository);
      onImport(project);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function folder(e) {
    const picked = [...e.target.files];
    e.target.value = '';
    if (!picked.length) return;
    setError('');
    setBusy(true);
    try {
      if (picked.length > 20000)
        throw new Error('This folder is too large. Choose a smaller project.');
      const entries = picked.map((f) => ({
        file: f,
        path: (f.webkitRelativePath || f.name)
          .split('/')
          .slice(f.webkitRelativePath ? 1 : 0)
          .join('/'),
      }));
      const selected = entries.filter(
        (e) => isSourcePath(e.path) && e.file.size <= LIMITS.fileBytes,
      );
      if (selected.length > LIMITS.files)
        throw new Error('Choose a folder with up to 120 source files.');
      if (selected.reduce((n, e) => n + e.file.size, 0) > LIMITS.totalBytes)
        throw new Error('Choose a folder with up to 3 MiB of source text.');
      const files = await Promise.all(
        selected.map(async (e) => ({ path: e.path, content: await e.file.text() })),
      );
      const project = createProject({
        name: picked[0].webkitRelativePath?.split('/')[0] || 'Local project',
        files,
        source: { type: 'local' },
      });
      project.excluded += picked.length - selected.length;
      onImport(project);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog title="Give your project a fresh start" onClose={onClose} busy={busy}>
      <p className="dialog-intro">Bring the code. We’ll help you find your next move.</p>
      <div className="segmented">
        <button
          className={mode === 'github' ? 'selected' : ''}
          onClick={() => {
            setMode('github');
            setError('');
          }}
          disabled={busy}
        >
          <Github size={17} /> GitHub repository
        </button>
        <button
          className={mode === 'folder' ? 'selected' : ''}
          onClick={() => {
            setMode('folder');
            setError('');
          }}
          disabled={busy}
        >
          <FolderUp size={17} /> Local folder
        </button>
      </div>
      {mode === 'github' ? (
        <form onSubmit={github}>
          <label className="field-label" htmlFor="repository">
            Public repository
          </label>
          <input
            id="repository"
            className="text-input"
            placeholder="https://github.com/you/your-project"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            required
            disabled={busy}
            autoFocus
          />
          <p className="field-help">
            We’ll read the default branch. Your repository stays untouched. If the shared service is
            rate-limited, your browser reads public GitHub directly.
          </p>
          <button className="button primary full" disabled={busy || !repository.trim()}>
            {busy ? (
              <>
                <LoaderCircle size={17} className="spin" /> Reading repository…
              </>
            ) : (
              <>
                Import & assess project <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="folder-drop">
          <FolderUp size={36} />
          <h3>A fresh perspective on your local code.</h3>
          <p>Select a project folder. Files stay in this browser.</p>
          <label className={`button primary ${busy ? 'disabled' : ''}`}>
            {busy ? 'Reading files…' : 'Choose project folder'}
            <input
              className="visually-hidden"
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={folder}
              disabled={busy}
            />
          </label>
        </div>
      )}
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      <div className="privacy-note">
        <LockKeyhole size={16} />
        <p>
          Up to 120 source files, 128 KiB each, 3 MiB total. Dependencies, generated files, known
          secret filenames, and private keys are excluded. Credentials inside ordinary code may
          still be present.
        </p>
      </div>
    </Dialog>
  );
}
