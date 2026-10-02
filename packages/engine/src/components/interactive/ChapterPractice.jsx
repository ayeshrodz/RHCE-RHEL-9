import { readStored, writeStored } from '@/lib/storage';
import Quiz from './Quiz';

/** Logs an answer as a practice attempt, which the learning dashboard reads. */
function recordAttempt(challengeId, passed) {
  const key = `challenge:${challengeId}`;
  writeStored(key, [...readStored(key, []).slice(-49), { at: new Date().toISOString(), passed, hints: 0, solutionViewed: false }]);
}

/**
 * The chapter's practice questions, shown in the same multiple-choice format
 * as every other knowledge check. The questions come from the page's practice data.
 */
export default function ChapterPractice({ chapter, challenges: authored }) {
  const own = authored.filter((c) => c.chapter === chapter);
  const questions = own.map((c) => ({
    id: `challenge-${c.id}`,
    challengeId: c.id,
    q: c.prompt,
    code: c.code,
    options: c.options,
    answer: c.options.indexOf(c.expected),
    explain: c.explain,
  }));
  return (
    <Quiz
      id="practice"
      title={`Chapter ${Number(chapter.slice(2))} practice`}
      questions={questions}
      onAnswer={(question, choice) => recordAttempt(question.challengeId, choice === question.answer)}
    />
  );
}
