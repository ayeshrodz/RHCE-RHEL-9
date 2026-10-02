import { RotateCcw } from 'lucide-react';
import { useStored } from '@/lib/storage';
import { usePageKey } from '@/lib/pageContext';
import { Inline } from './inline';
import { ActivityPanel, ActivityFeedback } from './ActivityPanel';
import AnswerOptions from './AnswerOptions';
import { latestAnswer, recordAnswer, resetQuiz } from '@/lib/progressModel';

const EMPTY = { version: 2, items: {} };

/**
 * Multiple-choice quiz with instant feedback and a running score.
 * questions: [{ q, options: [...], answer: index, explain, code? }]
 * onAnswer(question, choice) lets a caller keep its own record as well.
 */
export default function Quiz({ id = 'quiz', title, questions, onAnswer }) {
  const pageKey = usePageKey();
  const [answers, setAnswers] = useStored(`quiz:${pageKey}:${id}`, EMPTY);

  const answered = questions.filter((q) => latestAnswer(answers.items[q.id], q) !== undefined).length;
  const correct = questions.filter((q) => latestAnswer(answers.items[q.id], q) === q.answer).length;
  const finished = answered === questions.length;
  const single = questions.length === 1;

  return (
    <ActivityPanel
      className={single ? 'is-single' : ''}
      aria-label={title ?? 'Quiz'}
      title={single ? null : (title ?? 'Check your understanding')}
      meta={answered ? `${correct} / ${questions.length} correct` : `${questions.length} questions`}
    >
      <ol className="quiz-list">
        {questions.map((item, qi) => {
          const history = answers.items[item.id];
          const chosen = latestAnswer(history, item);
          const done = chosen !== undefined;
          return (
            <li key={item.id} id={item.id} className="quiz-item">
              <p className="quiz-q">
                {single ? <span className="quiz-q-kicker">Quick check</span> : <span className="quiz-q-num">{qi + 1}</span>}
                <span className="quiz-q-text">
                  <Inline text={item.q} />
                </span>
              </p>
              {item.code && <pre className="quiz-code">{item.code}</pre>}
              {history?.attempts.length > 0 && !done && (
                <p className="quiz-history">{history.attempts.length} earlier attempt(s) kept. Answer this version again.</p>
              )}
              <AnswerOptions
                options={item.options}
                value={chosen}
                answer={item.answer}
                disabled={done}
                label={`Answers to question ${qi + 1}`}
                onChange={(index) => {
                  setAnswers((a) => recordAnswer(a, item, index));
                  onAnswer?.(item, index);
                }}
              />
              {done && item.explain && (
                <ActivityFeedback correct={chosen === item.answer} label={chosen === item.answer ? 'Correct.' : 'Not quite.'}>
                  <Inline text={item.explain} />
                </ActivityFeedback>
              )}
            </li>
          );
        })}
      </ol>

      {(finished || (single && answered > 0)) && (
        <footer className="quiz-foot">
          {!single && (
            <p>
              {correct === questions.length
                ? 'Every answer is correct. Try applying these ideas in the lab.'
                : correct >= questions.length * 0.7
                  ? 'Good work. Re-read the explanations for the ones you missed.'
                  : 'Worth another pass through the lessons before moving on.'}
            </p>
          )}
          <button className="btn btn-sm" onClick={() => setAnswers(resetQuiz)}>
            <RotateCcw size={13} /> {single ? 'Try again' : 'Try quiz again'}
          </button>
        </footer>
      )}
    </ActivityPanel>
  );
}
