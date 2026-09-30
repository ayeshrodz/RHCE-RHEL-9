import { useCallback } from 'react';
import { useStored } from '@/lib/storage';
import { pages } from '@/lib/course';

const EMPTY = [];

/** Pages the reader has marked complete, stored as "ch01/why-automate" keys. */
export function useProgress() {
  const [done, setDone] = useStored('completed', EMPTY);

  const isDone = useCallback((key) => done.includes(key), [done]);
  const toggle = useCallback((key) => setDone((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key])), [setDone]);
  const markDone = useCallback((key) => setDone((list) => (list.includes(key) ? list : [...list, key])), [setDone]);

  const valid = done.filter((k) => pages.some((p) => p.key === k));
  const percent = pages.length ? Math.round((valid.length / pages.length) * 100) : 0;

  return { done: valid, isDone, toggle, markDone, percent, total: pages.length };
}

export function chapterProgress(chapter, done) {
  const keys = chapter.sections.map((s) => `${chapter.id}/${s.slug}`);
  const count = keys.filter((k) => done.includes(k)).length;
  return { count, total: keys.length };
}
