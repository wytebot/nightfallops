import type { GameMode } from './game';

const DB_NAME = 'wytegames-nightfall';
const STORE = 'profiles';
const KEY = 'local-profile-v2';
const LEGACY_LOCAL_KEYS = ['nightfall-ops-save-v1', 'nightfall-ops-save'];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local save database'));
  });
}
function readCompatibilitySnapshot<T>(fallback: T): T | undefined {
  for (const key of LEGACY_LOCAL_KEYS) {
    try { const raw = localStorage.getItem(key); if (raw) return { ...fallback as object, ...JSON.parse(raw) } as T; } catch { /* try next legacy key */ }
  }
  return undefined;
}
function mergeLegacyProfile<T>(indexed: T, local: T): T {
  const db = indexed as any, ls = local as any;
  const dbTime = Number(db?.updatedAt || 0), localTime = Number(ls?.updatedAt || 0);
  // The compatibility snapshot wins only when it carries a newer timestamp. Otherwise IndexedDB
  // remains authoritative for scalar balances; append-only histories and owned skins are unioned.
  const localWins = localTime > dbTime || (!dbTime && !localTime && String(ls?.lastReward || '') > String(db?.lastReward || ''));
  const base = localWins ? ls : db;
  const union = (a: unknown[] = [], b: unknown[] = []) => Array.from(new Map([...a, ...b].map(item => [JSON.stringify(item), item] as const)).values());
  const histories = ['missionHistory', 'activityHistory', 'purchaseHistory'];
  const merged: any = { ...db, ...base };
  for (const field of histories) merged[field] = union(Array.isArray(db?.[field]) ? db[field] : [], Array.isArray(ls?.[field]) ? ls[field] : []);
  const dbInventory = db?.inventory || {}, localInventory = ls?.inventory || {};
  merged.inventory = {
    ...dbInventory,
    ...(localWins ? localInventory : dbInventory),
    partnerCount: Math.max(Number(dbInventory.partnerCount || 0), Number(localInventory.partnerCount || 0)),
    armyCount: Math.max(Number(dbInventory.armyCount || 0), Number(localInventory.armyCount || 0)),
    lifePacks: Math.max(Number(dbInventory.lifePacks || 0), Number(localInventory.lifePacks || 0)),
    magicPacks: Math.max(Number(dbInventory.magicPacks || 0), Number(localInventory.magicPacks || 0)),
    ownedSkins: Array.from(new Set([...(dbInventory.ownedSkins || []), ...(localInventory.ownedSkins || [])])),
  };
  merged.bestLevel = Math.max(Number(db?.bestLevel || 1), Number(ls?.bestLevel || 1));
  merged.resumeLevel = Math.max(1, Number(db?.resumeLevel || 1), Number(ls?.resumeLevel || 1));
  merged.lastReward = String(db?.lastReward || '') > String(ls?.lastReward || '') ? db.lastReward : (ls?.lastReward || db?.lastReward || '');
  return merged as T;
}
export async function loadProfile<T>(fallback: T): Promise<T> {
  const compatibility = readCompatibilitySnapshot(fallback);
  try {
    const db = await openDb();
    const value = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly'); const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result as T | undefined); req.onerror = () => reject(req.error);
    });
    db.close();
    if (value && compatibility) return mergeLegacyProfile(value, compatibility);
    if (value) return value;
  } catch { /* localStorage migration fallback */ }
  return compatibility ?? fallback;
}
export async function saveProfile<T>(value: T): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(value, KEY);
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
    db.close();
    // Keep a compatibility snapshot for recovery; IndexedDB remains primary.
    try { localStorage.setItem('nightfall-ops-save-v1', JSON.stringify(value)); } catch { /* quota-safe */ }
  } catch { try { localStorage.setItem('nightfall-ops-save-v1', JSON.stringify(value)); } catch { /* no storage available */ } }
}
export type CloudCheckpoint = { level:number; mode:GameMode; location:string; timeOfDay:'Night'|'Day'; savedAt:number };
