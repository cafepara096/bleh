/** Almacenamiento de PDFs en IndexedDB (hasta ~150MB por archivo). */

const DB_NAME = 'dnd-homebrew-pdf-db';
const DB_VERSION = 1;
const STORE = 'pdfs';

export type StoredPdf = {
  id: string;
  name: string;
  /** Blob del PDF */
  blob: Blob;
  addedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function listPdfs(): Promise<{ id: string; name: string; addedAt: string; size: number }[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const rows = (req.result as StoredPdf[]).map((r) => ({
        id: r.id,
        name: r.name,
        addedAt: r.addedAt,
        size: r.blob?.size ?? 0,
      }));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getPdf(id: string): Promise<StoredPdf | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as StoredPdf) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function putPdf(doc: StoredPdf): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(doc);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePdf(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllPdfs(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const MAX_PDF_BYTES = 150 * 1024 * 1024; // 150 MB
