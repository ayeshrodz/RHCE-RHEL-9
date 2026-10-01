import { useId, useState } from 'react';
import { useStored } from '@/lib/storage';
import { evaluateChallenge, solutionFor } from '@/lib/challengeEngine';
import { challenges } from '@/data/challenges';

export function Challenge({ challenge }) {
  const uid = useId();
  const [input, setInput] = useState(challenge.starter);
  const [feedback, setFeedback] = useState(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useStored(`challenge:${challenge.id}`, []);
  const check = () => {
    const result = evaluateChallenge(challenge, input);
    setFeedback(result);
    if (input.trim())
      setAttempts((old) => [
        ...old.slice(-49),
        { at: new Date().toISOString(), passed: result.passed, hints, solutionViewed: showSolution },
      ]);
  };
  return (
    <section id={`challenge-${challenge.id}`} className="challenge widget" aria-labelledby={`${uid}-title`}>
      <p className="widget-label">Browser practice · simulation</p>
      <h3 id={`${uid}-title`}>{challenge.title}</h3>
      <p>{challenge.prompt}</p>
      <p className="challenge-scope">This activity checks the stated requirement. It does not run Ansible or change a machine.</p>
      {challenge.inventory && <pre>{challenge.inventory}</pre>}
      {challenge.type === 'choice' ? (
        <fieldset>
          <legend>Your answer</legend>
          {challenge.options.map((o) => (
            <label key={o} className="challenge-option">
              <input
                type="radio"
                name={uid}
                checked={input === o}
                onChange={() => {
                  setInput(o);
                  setFeedback(null);
                }}
              />{' '}
              {o}
            </label>
          ))}
        </fieldset>
      ) : (
        <>
          <label htmlFor={`${uid}-input`}>Your {challenge.type === 'yaml' ? 'YAML' : 'answer'}</label>
          <textarea
            id={`${uid}-input`}
            value={input}
            maxLength={20000}
            rows={Math.min(12, Math.max(3, input.split('\n').length + 1))}
            spellCheck={false}
            onChange={(e) => {
              setInput(e.target.value);
              setFeedback(null);
            }}
          />
        </>
      )}
      <div className="challenge-actions">
        <button className="btn btn-primary btn-sm" onClick={check}>
          Check answer
        </button>
        <button className="btn btn-sm" disabled={hints >= challenge.hints.length} onClick={() => setHints(hints + 1)}>
          Next hint
        </button>
        <button
          className="btn btn-sm"
          onClick={() => {
            setInput(challenge.starter);
            setFeedback(null);
            setHints(0);
            setShowSolution(false);
          }}
        >
          Reset activity
        </button>
      </div>
      <div aria-live="polite" role="status">
        {feedback && (
          <p className={feedback.passed ? 'practice-pass' : 'practice-retry'}>
            {feedback.passed ? 'Requirement met. ' : 'Try again. '}
            {feedback.feedback}
          </p>
        )}
      </div>
      {hints > 0 && (
        <ol className="challenge-hints">
          {challenge.hints.slice(0, hints).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      )}
      <button className="btn btn-ghost btn-sm" aria-expanded={showSolution} onClick={() => setShowSolution(!showSolution)}>
        {showSolution ? 'Hide the explained solution' : 'Show an explained solution'}
      </button>
      {showSolution && (
        <div>
          <pre>{solutionFor(challenge)}</pre>
          <p>{challenge.explain}</p>
        </div>
      )}
      <p className="challenge-history">
        {attempts.length} saved attempts · {attempts.filter((a) => a.passed).length} successful. Reading progress is tracked separately.
      </p>
    </section>
  );
}
export default function ChapterPractice({ chapter }) {
  return (
    <div className="chapter-practice">
      {challenges
        .filter((c) => c.chapter === chapter)
        .map((c) => (
          <Challenge key={c.id} challenge={c} />
        ))}
    </div>
  );
}
