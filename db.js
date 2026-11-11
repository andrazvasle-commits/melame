/* ===== db.js — IndexedDB sloj (shranjevanje pesmi + dostop) ===== */
const DB_NAME = "melame_db";
const DB_VERSION = 1;
const STORE_SONGS = "songs";
const STORE_META = "meta";

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_SONGS)) {
        db.createObjectStore(STORE_SONGS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    req.onsuccess = (e) => {
      _db = e.target.result;
      resolve(_db);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

function tx(store, mode) {
  return _db.transaction(store, mode).objectStore(store);
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* --- Pesmi --- */
async function dbAddSong(song) {
  await openDB();
  const r = tx(STORE_SONGS, "readwrite").put(song);
  return reqToPromise(r);
}

async function dbGetAllSongs() {
  await openDB();
  const r = tx(STORE_SONGS, "readonly").getAll();
  return reqToPromise(r);
