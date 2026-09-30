// Tiny localStorage-backed store with subscriptions, so every component
// reading a key re-renders when any other component writes it, including
// components in other open tabs of the site.
import { useCallback, useSyncExternalStore } from 'react';

const PREFIX = 'rhce:';
const APP_ID = 'rhce-field-guide';
const EXPORT_VERSION = 1;
// Display preferences: kept on reset and left out of progress exports.
const PREFERENCES = new Set(['theme', 'sidebarCollapsed', 'labValues']);
const listeners = new Map();
const cache = new Map();

function read(key, fallback) {
  if (cache.has(key)) return cache.get(key);
  let value = fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) value = JSON.parse(raw);
  } catch {
    /* private mode or corrupted value: use fallback */
  }
  cache.set(key, value);
  return value;
}

function notify(key) {
  listeners.get(key)?.forEach((fn) => fn());
}

function write(key, value) {
  cache.set(key, value);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep in-memory value */
  }
  notify(key);
}

function subscribe(key, fn) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(fn);
  return () => listeners.get(key).delete(fn);
}

// Another tab changed storage: drop our cached copy and re-render readers.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === null) {
      for (const key of [...cache.keys()]) {
        cache.delete(key);
        notify(key);
      }
    } else if (e.key.startsWith(PREFIX)) {
      const key = e.key.slice(PREFIX.length);
      cache.delete(key);
      notify(key);
    }
  });
}

export function useStored(key, fallback) {
  const value = useSyncExternalStore(
    (fn) => subscribe(key, fn),
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback((next) => write(key, typeof next === 'function' ? next(read(key, fallback)) : next), [key, fallback]);
  return [value, set];
}

function progressKeys() {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .map((k) => k.slice(PREFIX.length))
      .filter((k) => !PREFERENCES.has(k));
  } catch {
    return [];
  }
}

export function resetAllProgress() {
  for (const key of progressKeys()) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  }
  for (const key of [...cache.keys()]) {
    if (PREFERENCES.has(key)) continue;
    cache.delete(key);
    notify(key);
  }
}

/** Everything the reader has done (not the theme), as a JSON-safe object. */
export function exportProgress() {
  const data = {};
  for (const key of progressKeys()) data[key] = read(key, null);
  return { app: APP_ID, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data };
}

/** Restore a file produced by exportProgress(). Replaces current progress. */
export function importProgress(payload) {
  if (!payload || payload.app !== APP_ID || typeof payload.data !== 'object') {
    throw new Error('This file is not an RHCE Field Guide progress export.');
  }
  if (payload.version > EXPORT_VERSION) {
    throw new Error('This export was made by a newer version of the guide.');
  }
  resetAllProgress();
  for (const [key, value] of Object.entries(payload.data)) {
    if (!PREFERENCES.has(key)) write(key, value);
  }
  return Object.keys(payload.data).length;
}
