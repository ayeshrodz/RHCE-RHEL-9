import { Check, RotateCcw, X } from 'lucide-react';
import { useStored } from '@/lib/storage';
import { usePageKey } from '@/lib/pageContext';
import { Inline } from './inline';

const EMPTY = {};
const LETTERS = 'ABCDEFG';

/**
 * Multiple-choice quiz with instant feedback and a running score.
 * questions: [{ q, options: [...], answer: index, explain, code? }]
 */
export default function Quiz({ id = 'quiz', title, questions }) {
  const pageKey = usePageKey();
  const [answers, setAnswers] = useStored(`quiz:${pageKey}:${id}`, EMPTY);

  const answered = Object.keys(answers).length;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const finished = answered === questions.length;
  const single = questions.length === 1;

  return (
    <section className={`quiz ${single ? 'is-single' : ''}`} aria-label={title ?? 'Quiz'}>
      {!single && (
        <header className="quiz-head">
          <p className="quiz-title">{title ?? 'Check your understanding'}</p>
          <span className="quiz-score">{answered ? `${correct} / ${questions.length} correct` : `${questions.length} questions`}</span>
        </header>
      )}

      <ol className="quiz-list">
        {questions.map((item, qi) => {
          const chosen = answers[qi];
          const done = chosen !== undefined;
          return (
            <li key={qi} className="quiz-item">
              <p className="quiz-q">
                {single ? <span className="quiz-q-kicker">Quick check</span> : <span className="quiz-q-num">{qi + 1}</span>}
                <Inline text={item.q} />
              </p>
              {item.code && <pre className="quiz-code">{item.code}</pre>}
              <div className="quiz-options" role="radiogroup">
                {item.options.map((opt, oi) => {
                  const isAnswer = oi === item.answer;
                  const state = !done ? '' : isAnswer ? 'is-correct' : oi === chosen ? 'is-wrong' : 'is-muted';
                  return (
                    <button
                      key={oi}
                      role="radio"
                      aria-checked={chosen === oi}
                      className={`quiz-option ${state}`}
                      disabled={done}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    >
                      <span className="quiz-letter">
                        {done && isAnswer ? (
                          <Check size={13} strokeWidth={3} />
                        ) : done && oi === chosen ? (
                          <X size={13} strokeWidth={3} />
                        ) : (
                          LETTERS[oi]
                        )}
                      </span>
                      <span>
                        <Inline text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {done && item.explain && (
                <p className={`quiz-explain ${chosen === item.answer ? 'is-correct' : 'is-wrong'}`}>
                  <strong>{chosen === item.answer ? 'Correct. ' : 'Not quite. '}</strong>
                  <Inline text={item.explain} />
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {(finished || (single && answered)) && (
        <footer className="quiz-foot">
          {!single && (
            <p>
              {correct === questions.length
                ? 'Perfect score. You are ready for the next chapter.'
                : correct >= questions.length * 0.7
                  ? 'Good work. Re-read the explanations for the ones you missed.'
                  : 'Worth another pass through the lessons before moving on.'}
            </p>
          )}
          <button className="btn btn-sm" onClick={() => setAnswers(EMPTY)}>
            <RotateCcw size={13} /> {single ? 'Try again' : 'Reset quiz'}
          </button>
        </footer>
      )}
    </section>
  );
}
