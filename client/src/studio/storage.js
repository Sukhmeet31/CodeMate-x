export function createStorage(factory = globalThis.indexedDB) {
  let connection;
  let queue = Promise.resolve();
  function open() {
    if (!connection)
      connection = new Promise((resolve, reject) => {
        if (!factory) {
          reject(
            new Error('Browser storage is unavailable. Enable IndexedDB to save this workspace.'),
          );
          return;
        }
        const request = factory.open('codemate-rescue-v1', 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains('workspace'))
            request.result.createObjectStore('workspace');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error || new Error('Could not open browser storage.'));
        request.onblocked = () =>
          reject(
            new Error('Storage is blocked by another tab. Close other CodeMate-X tabs and reload.'),
          );
      });
    return connection;
  }
  return {
    async load() {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('workspace', 'readonly');
        const request = tx.objectStore('workspace').get('current');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    },
    save(workspace) {
      const snapshot = structuredClone(workspace);
      const write = queue
        .catch(() => {})
        .then(async () => {
          const db = await open();
          await new Promise((resolve, reject) => {
            const tx = db.transaction('workspace', 'readwrite');
            tx.objectStore('workspace').put(snapshot, 'current');
            tx.oncomplete = () => resolve();
            tx.onerror = () =>
              reject(tx.error || new Error('Could not save. Export a backup before leaving.'));
            tx.onabort = () =>
              reject(
                tx.error || new Error('Save was interrupted. Export a backup before leaving.'),
              );
          });
        });
      queue = write;
      return write;
    },
  };
}
