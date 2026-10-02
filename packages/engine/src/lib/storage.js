// Tiny localStorage-backed store with subscriptions, so every component
// reading a key re-renders when any other component writes it, including
// components in other open tabs of the site.
import { useCallback, useSyncExternalStore } from 'react';
import { migrateEntry } from './progressModel.js';
import { validateLabReport } from './labReports.js';

// Kept from the site's first name, so that saved progress survives the rename.
const PREFIX = 'rhce:';
const APP_ID = 'kernel-path';
// Exports made before the site was renamed are still accepted.
const OLD_APP_IDS = ['playbook-path', 'rhce-field-guide'];
const EXPORT_VERSION = 3;
// Display preferences: kept on reset and left out of progress exports.
const PREFERENCES = new Set(['theme', 'sidebarCollapsed', 'labValues', 'labEnv', 'labMode']);
// Progress belongs to one program: its keys are stored as "<program>@<key>". Display
// preferences stay shared by every program.
let scope = null;
const listeners = new Map();
const cache = new Map();
const savedKeys = new Set();
const invalidKeys = new Set();
let revision = 0;
let storageAvailable = true;

/** Choose the program that progress is read from and written to. */
export function setProgramScope(id) {
  scope = id;
}

const scoped = (key) => (scope === null || PREFERENCES.has(key) ? key : `${scope}@${key}`);
const inScope = (full) => scope !== null && full.startsWith(`${scope}@`);

export function readStored(key, fallback) {
  const full = scoped(key);
  if (cache.has(full)) return cache.get(full);
  let value = fallback;
  let raw = null;
  try {
    raw = localStorage.getItem(PREFIX + full);
  } catch {
    storageAvailable = false;
  }
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      value = PREFERENCES.has(key) ? parsed : validateProgress({ app: APP_ID, version: EXPORT_VERSION, data: { [key]: parsed } })[key];
      invalidKeys.delete(full);
      savedKeys.add(full);
    } catch {
      invalidKeys.add(full);
    }
  }
  cache.set(full, value);
  return value;
}

/** A program's completed pages, read without switching to it (for summaries on other pages). */
export function readProgramCompleted(id) {
  if (id === scope) return readStored('completed', []);
  try {
    const value = JSON.parse(localStorage.getItem(`${PREFIX}${id}@completed`));
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function notify(key) {
  revision++;
  listeners.get(key)?.forEach((fn) => fn());
  listeners.get('*')?.forEach((fn) => fn());
}

export function writeStored(key, value) {
  const full = scoped(key);
  cache.set(full, value);
  savedKeys.add(full);
  invalidKeys.delete(full);
  try {
    localStorage.setItem(PREFIX + full, JSON.stringify(value));
  } catch {
    storageAvailable = false;
  }
  notify(full);
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
    (fn) => subscribe(scoped(key), fn),
    () => readStored(key, fallback),
    () => fallback,
  );
  const set = useCallback((next) => writeStored(key, typeof next === 'function' ? next(readStored(key, fallback)) : next), [key, fallback]);
  return [value, set];
}

/** The current program's saved keys, without the program prefix. */
function progressKeys() {
  const full = [...savedKeys];
  try {
    full.push(
      ...Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .map((k) => k.slice(PREFIX.length)),
    );
  } catch {
    /* storage unavailable: use what this page saved */
  }
  return [...new Set(full.filter(inScope).map((k) => k.slice(scope.length + 1)))];
}

/** Forget the current program's progress. Preferences and other programs are untouched. */
export function resetAllProgress() {
  for (const key of progressKeys()) {
    try {
      localStorage.removeItem(PREFIX + scoped(key));
    } catch {
      /* ignore */
    }
  }
  for (const full of [...cache.keys()]) {
    if (!inScope(full)) continue;
    savedKeys.delete(full);
    invalidKeys.delete(full);
    cache.delete(full);
    notify(full);
  }
}

/** Everything the reader has done in the current program (not preferences), as a JSON-safe object. */
export function exportProgress() {
  const data = {};
  for (const key of progressKeys()) {
    const value = readStored(key, null);
    if (!invalidKeys.has(scoped(key))) data[key] = value;
  }
  return { app: APP_ID, version: EXPORT_VERSION, program: scope, exportedAt: new Date().toISOString(), data };
}

const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const indices = (v, min = 0) => Array.isArray(v) && v.every((n) => Number.isSafeInteger(n) && n >= min);

export function validateProgress(payload) {
  if (!record(payload) || ![APP_ID, ...OLD_APP_IDS].includes(payload.app) || !record(payload.data)) {
    throw new Error('This file is not a Kernel Path progress export.');
  }
  if (!Number.isInteger(payload.version) || payload.version < 1 || payload.version > EXPORT_VERSION) {
    throw new Error('This progress export version is not supported.');
  }
  if (
    payload.program !== undefined &&
    payload.program !== null &&
    (typeof payload.program !== 'string' || !/^[a-z][a-z0-9-]*$/.test(payload.program))
  )
    throw new Error('This progress file does not name a valid program.');
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
  if (payload.program && scope !== null && payload.program !== scope)
    throw new Error(`This progress file is for the program "${payload.program}", not "${scope}".`);
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
