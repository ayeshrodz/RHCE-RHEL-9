import legacy from '../data/legacyActivityMap.json' with { type: 'json' };

import { questionRevision } from '@kernel-path/schema/revision';

export { questionRevision };

/** Frozen positional maps make older data independent of today's content order. */
export function migrateEntry(key, value) {
  if (key === 'readiness' && value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([id, rating]) => [legacy.readiness[id] ?? id, rating]));
  }
  if (legacy.labs[key] && Array.isArray(value)) {
    return [...new Set(value.map((id) => (typeof id === 'number' ? (legacy.labs[key][id - 1] ?? `legacy-task-${id}`) : id)))];
  }
  if (key.startsWith('quiz:') && value && !value.version) {
    const items = {};
    for (const [index, choice] of Object.entries(value)) {
      const id = legacy.quizzes[key]?.[index] ?? `legacy-question-${index}`;
      items[id] = { active: false, attempts: [{ at: null, choice, correct: null, revision: 'legacy' }] };
    }
    return { version: 2, items };
  }
  return value;
}

export function latestAnswer(item, question) {
  const latest = item?.attempts.at(-1);
  return item?.active && latest?.revision === questionRevision(question) ? latest.choice : undefined;
}

export function recordAnswer(quiz, question, choice, at = new Date().toISOString()) {
  const previous = quiz.items[question.id]?.attempts ?? [];
  return {
    version: 2,
    items: {
      ...quiz.items,
      [question.id]: {
        active: true,
        attempts: [...previous.slice(-49), { at, choice, correct: choice === question.answer, revision: questionRevision(question) }],
      },
    },
  };
}

export function resetQuiz(quiz) {
  return { version: 2, items: Object.fromEntries(Object.entries(quiz.items).map(([id, item]) => [id, { ...item, active: false }])) };
}
