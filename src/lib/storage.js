// Tiny localStorage-backed store with subscriptions, so every component
// reading a key re-renders when any other component writes it, including
// components in other open tabs of the site.
import { useCallback, useSyncExternalStore } from 'react';
import { migrateEntry } from './progressModel.js';
import { validateLabReport } from './labReports.js';

// Kept from the site's first name, so that saved progress survives the rename.
const PREFIX = 'rhce:';
const APP_ID = 'playbook-path';
// Exports made before the site was renamed are still accepted.
const OLD_APP_IDS = ['rhce-field-guide'];
const EXPORT_VERSION = 2;
// Display preferences: kept on reset and left out of progress exports.
const PREFERENCES = new Set(['theme', 'sidebarCollapsed', 'labValues', 'labEnv', 'labMode']);
const listeners = new Map();
const cache = new Map();
const savedKeys = new Set();
const invalidKeys = new Set();
let revision = 0;
let storageAvailable = true;

export function readStored(key, fallback) {
  if (cache.has(key)) return cache.get(key);
  let value = fallback;
  let raw = null;
  try {
    raw = localStorage.getItem(PREFIX + key);
  } catch {
    storageAvailable = false;
  }
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      value = PREFERENCES.has(key) ? parsed : validateProgress({ app: APP_ID, version: EXPORT_VERSION, data: { [key]: parsed } })[key];
      invalidKeys.delete(key);
      savedKeys.add(key);
    } catch {
      invalidKeys.add(key);
    }
  }
  cache.set(key, value);
  return value;
}

function notify(key) {
  revision++;
  listeners.get(key)?.forEach((fn) => fn());
  listeners.get('*')?.forEach((fn) => fn());
}

export function writeStored(key, value) {
  cache.set(key, value);
  savedKeys.add(key);
  invalidKeys.delete(key);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    storageAvailable = false;
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
      savedKeys.clear();
      for (const key of [...cache.keys()]) {
        cache.delete(key);
        notify(key);
      }
    } else if (e.key.startsWith(PREFIX)) {
      const key = e.key.slice(PREFIX.length);
      cache.delete(key);
      if (e.newValue === null) savedKeys.delete(key);
      else savedKeys.add(key);
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
  const keys = [...savedKeys].filter((k) => !PREFERENCES.has(k));
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
    savedKeys.delete(key);
    cache.delete(key);
    notify(key);
  }
}

/** Everything the reader has done (not the theme), as a JSON-safe object. */
export function exportProgress() {
  const data = {};
  for (const key of progressKeys()) {
    const value = readStored(key, null);
    if (!invalidKeys.has(key)) data[key] = value;
  }
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
    else if (key === 'readiness')
      valid = record(value) && Object.entries(value).every(([id, v]) => /^ch\d+(?:\.[a-z0-9-]+|:\d+)$/.test(id) && [0, 1, 2].includes(v));
    else if (/^lab:ch\d+\/[a-z0-9-]+:[a-z0-9-]+$/.test(key))
      valid = indices(value, 1) || (Array.isArray(value) && value.every((v) => typeof v === 'string' && /^[a-z0-9-]+$/.test(v)));
    else if (/^quiz:ch\d+\/[a-z0-9-]+:[a-z0-9-]+$/.test(key)) {
      valid =
        record(value) &&
        (Object.entries(value).every(([k, v]) => /^\d+$/.test(k) && Number.isSafeInteger(v) && v >= 0) || validQuiz(value));
    } else if (/^challenge:[a-z0-9-]+$/.test(key))
      valid =
        Array.isArray(value) &&
        value.length <= 50 &&
        value.every(
          (v) =>
            record(v) &&
            typeof v.at === 'string' &&
            Number.isFinite(Date.parse(v.at)) &&
            typeof v.passed === 'boolean' &&
            Number.isInteger(v.hints) &&
            v.hints >= 0 &&
            typeof v.solutionViewed === 'boolean',
        );
    else if (key === 'labReports') {
      valid = Array.isArray(value) && value.length <= 100;
      if (valid) for (const report of value) validateLabReport(report);
    } else if (/^assessment:[a-z0-9-]+$/.test(key)) {
      valid = value === null || (record(value) && Number.isSafeInteger(value.endsAt) && value.endsAt > 0);
    }
    if (!valid) throw new Error(`Invalid progress entry: ${key}`);
    data[key] = migrateEntry(key, value);
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

/** A stable revision snapshot makes aggregate progress update across components and tabs. */
export function useProgressData() {
  useSyncExternalStore(
    (fn) => subscribe('*', fn),
    () => revision,
    () => 0,
  );
  return { data: exportProgress().data, storageAvailable };
}

function validQuiz(value) {
  return (
    value.version === 2 &&
    record(value.items) &&
    Object.entries(value.items).every(
      ([id, item]) =>
        /^[a-z0-9-]+$/.test(id) &&
        record(item) &&
        typeof item.active === 'boolean' &&
        Array.isArray(item.attempts) &&
        item.attempts.length <= 50 &&
        item.attempts.every(
          (attempt) =>
            record(attempt) &&
            (attempt.at === null || (typeof attempt.at === 'string' && Number.isFinite(Date.parse(attempt.at)))) &&
            Number.isSafeInteger(attempt.choice) &&
            attempt.choice >= 0 &&
            attempt.choice <= 99 &&
            (typeof attempt.correct === 'boolean' || (attempt.correct === null && attempt.revision === 'legacy')) &&
            typeof attempt.revision === 'string' &&
            /^[a-z0-9-]{1,30}$/.test(attempt.revision),
        ),
    )
  );
}
