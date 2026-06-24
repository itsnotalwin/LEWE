/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LifeOSData } from './types';

const DB_NAME = 'LifeOSDatabase';
const STORE_NAME = 'LifeOSStateStore';
const DB_VERSION = 1;
const RECORD_KEY = 'life_os_state_v1';

/**
 * Initializes and returns the IndexedDB instance
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Persists the entire application state into IndexedDB and localStorage
 */
export async function saveState(data: LifeOSData): Promise<void> {
  // Always update localStorage as a robust real-time secondary backup
  try {
    localStorage.setItem('life_os_data_v1', JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage secondary backup failed', err);
  }

  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, RECORD_KEY);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to save state to IndexedDB'));
      };
    });
  } catch (err) {
    console.error('IndexedDB save failed, operating on localStorage fallback only:', err);
  }
}

/**
 * Retrieves the application state from IndexedDB, falling back to localStorage
 */
export async function loadState(): Promise<LifeOSData | null> {
  let dbResult: LifeOSData | null = null;

  try {
    const db = await initDB();
    dbResult = await new Promise<LifeOSData | null>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(RECORD_KEY);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to load state from IndexedDB'));
      };
    });
  } catch (err) {
    console.warn('IndexedDB retrieval failed, attempting localStorage fallback:', err);
  }

  if (dbResult) {
    return dbResult;
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem('life_os_data_v1');
    if (local) {
      return JSON.parse(local) as LifeOSData;
    }
  } catch (err) {
    console.error('LocalStorage fallback loading failed:', err);
  }

  return null;
}

/**
 * Purges all records from IndexedDB and localStorage completely
 */
export async function clearAllStorage(): Promise<void> {
  // Clear all localStorage keys
  try {
    localStorage.removeItem('life_os_data_v1');
    // Keep user dark mode preference but clear other data keys if any exist
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== 'life-os-dark-mode') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to clear localStorage keys:', err);
  }

  // Clear IndexedDB completely
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to clear IndexedDB'));
      };
    });
  } catch (err) {
    console.error('IndexedDB clear failed:', err);
  }
}
