import { useEffect, useRef, useState } from 'react';
import { createStorage } from './storage';
import { validateBackup } from '../../../shared/project.js';

const empty = { version: 1, projects: [], activeProjectId: null };
export function useWorkspace() {
  const [data, setData] = useState({ workspace: empty, revision: 0 });
  const [ready, setReady] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [saveState, setSaveState] = useState('loading');
  const [error, setError] = useState('');
  const storage = useRef(null);
  const current = useRef(data);
  current.current = data;
  if (!storage.current) storage.current = createStorage();
  useEffect(() => {
    let active = true;
    let release;
    const controller = new AbortController();
    if (navigator.locks) {
      navigator.locks
        .request('codemate-rescue-writer', { signal: controller.signal }, async () => {
          if (!active) return;
          const held = new Promise((resolve) => {
            release = resolve;
          });
          try {
            const value = await storage.current.load();
            if (active) {
              if (value) validateBackup(value);
              setData({ workspace: value || empty, revision: 0 });
              setReady(true);
              setSaveState('saved');
              setReadOnly(false);
            }
          } catch (e) {
            if (active) {
              setError(e.message);
              setSaveState('error');
            }
          }
          if (!active) release();
          return held;
        })
        .catch((e) => {
          if (active && e.name !== 'AbortError')
            setError('Could not acquire workspace access. Close other tabs and reload.');
        });
    } else setReadOnly(false);
    storage.current
      .load()
      .then((value) => {
        if (!active) return;
        if (value) validateBackup(value);
        setData({ workspace: value || empty, revision: 0 });
        setReady(true);
        setSaveState('saved');
      })
      .catch((e) => {
        if (active) {
          setError(
            `Could not load saved projects: ${e.message} Reload after checking browser storage; existing data has not been replaced.`,
          );
          setSaveState('error');
        }
      });
    return () => {
      active = false;
      controller.abort();
      release?.();
    };
  }, []);
  useEffect(() => {
    if (!ready || readOnly || data.revision === 0) return;
    let active = true;
    setSaveState('saving');
    const timer = setTimeout(() => {
      storage.current
        .save(data.workspace)
        .then(() => {
          if (active) {
            setSaveState('saved');
            setError('');
          }
        })
        .catch((e) => {
          if (active) {
            setSaveState('error');
            setError(`Changes are not saved: ${e.message} Export a backup before leaving.`);
          }
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [data, ready, readOnly]);
  useEffect(() => {
    const preventLoss = (e) => {
      if (saveState !== 'saved' && current.current.revision > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [saveState]);
  function update(updater) {
    if (readOnly || !ready) return;
    setSaveState('saving');
    setData((old) => ({ workspace: updater(old.workspace), revision: old.revision + 1 }));
  }
  return { workspace: data.workspace, update, ready, readOnly, saveState, error };
}
