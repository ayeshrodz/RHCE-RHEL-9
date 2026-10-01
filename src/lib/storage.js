// Tiny localStorage-backed store with subscriptions, so every component
// reading a key re-renders when any other component writes it, including
// components in other open tabs of the site.
import { useCallback, useSyncExternalStore } from 'react';

// Kept from the site's first name, so that saved progress survives the rename.
const PREFIX = 'rhce:';
const APP_ID = 'playbook-path';
// Exports made before the site was renamed are still accepted.
const OLD_APP_IDS = ['rhce-field-guide'];
const EXPORT_VERSION = 1;
// Display preferences: kept on reset and left out of progress exports.
const PREFERENCES = new Set(['theme', 'sidebarCollapsed', 'labValues', 'labEnv']);
const listeners = new Map();
const cache = new Map();

export function readStored(key, fallback) {
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

export function writeStored(key, value) {
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
    () => readStored(key, fallback),
    () => fallback,
  );
  const set = useCallback((next) => writeStored(key, typeof next === 'function' ? next(readStored(key, fallback)) : next), [key, fallback]);
  return [value, set];
}

function progressKeys() {
  const keys = [...cache.keys()].filter((k) => !PREFERENCES.has(k));
  try {
    return [
      ...new Set([
        ...keys,
        ...Object.keys(localStorage)
          .filter((k) => k.startsWith(PREFIX))
          .map((k) => k.slice(PREFIX.length))
          .filter((k) => !PREFERENCES.has(k)),
      ]),
    ];
  } catch {
    return keys;
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
  for (const key of progressKeys()) data[key] = readStored(key, null);
  return { app: APP_ID, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data };
}

const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const indices = (v, min = 0) => Array.isArray(v) && v.every((n) => Number.isSafeInteger(n) && n >= min);

export function validateProgress(payload) {
  if (!record(payload) || ![APP_ID, ...OLD_APP_IDS].includes(payload.app) || !record(payload.data)) {
    throw new Error('This file is not a Playbook Path progress export.');
  }
  if (!Number.isInteger(payload.version) || payload.version < 1 || payload.version > EXPORT_VERSION) {
    throw new Error('This progress export version is not supported.');
  }
  if (JSON.stringify(payload).length > 2_000_000) throw new Error('This progress file is too large.');
  const data = {};
  for (const [key, value] of Object.entries(payload.data)) {
    if (PREFERENCES.has(key)) continue;
    let valid = false;
    if (key === 'completed') valid = Array.isArray(value) && value.every((v) => typeof v === 'string');
    else if (key === 'lastVisited') valid = value === null || typeof value === 'string';
    else if (key === 'readiness') valid = record(value) && Object.values(value).every((v) => [0, 1, 2].includes(v));
    else if (/^lab:ch\d+\/[a-z0-9-]+:[a-z0-9-]+$/.test(key)) valid = indices(value, 1);
    else if (/^quiz:ch\d+\/[a-z0-9-]+:[a-z0-9-]+$/.test(key)) {
      valid = record(value) && Object.entries(value).every(([k, v]) => /^\d+$/.test(k) && Number.isSafeInteger(v) && v >= 0);
    }
    if (!valid) throw new Error(`Invalid progress entry: ${key}`);
    data[key] = value;
  }
  return data;
}

/** Validate everything before replacing current progress. */
export function importProgress(payload) {
  const data = validateProgress(payload);
  resetAllProgress();
  for (const [key, value] of Object.entries(data)) writeStored(key, value);
  return Object.keys(data).length;
}
