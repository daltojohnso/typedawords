const DB_NAME = 'typedawords'
const STORE_NAME = 'epub'
const KEY = 'current'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function withTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDb().then((db) => {
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode)
      const req = fn(tx.objectStore(STORE_NAME))
      tx.oncomplete = () => { db.close(); resolve(req.result) }
      tx.onerror = () => { db.close(); reject(tx.error) }
    })
  })
}

export function storeEpub(buffer: ArrayBuffer, fileName: string): Promise<void> {
  return withTransaction('readwrite', (store) => store.put({ buffer, fileName }, KEY))
}

export function loadEpub(): Promise<{ buffer: ArrayBuffer; fileName: string } | null> {
  return withTransaction<{ buffer: ArrayBuffer; fileName: string } | null>(
    'readonly',
    (store) => store.get(KEY),
  ).then((result) => result ?? null)
}

export function clearEpub(): Promise<void> {
  return withTransaction('readwrite', (store) => store.delete(KEY))
}
