import CodeEditor from '@/components/interactive/CodeEditor';
import { useId, useState } from 'react';
import { useStored } from '@/lib/storage';
import { evaluateChallenge, solutionFor } from '@/lib/challengeEngine';
import { challenges } from 'virtual:challenges';
import { ActivityPanel, ActivityFeedback } from './ActivityPanel';
import AnswerOptions from './AnswerOptions';
import { Inline } from './inline';
import { Reveal } from '@/components/mdx/Layout';
import CodeBlock from '@/components/mdx/CodeBlock';

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
    <ActivityPanel
      id={`challenge-${challenge.id}`}
      className="challenge"
      aria-labelledby={`${uid}-title`}
      title={challenge.title}
      titleId={`${uid}-title`}
      titleAs="h3"
      meta="Browser practice"
    >
      <p className="quiz-q">
        <span className="quiz-q-text">
          <Inline text={challenge.prompt} />
        </span>
      </p>
      <p className="widget-sub">Simulation: checks the stated requirement without running Ansible or changing a machine.</p>
      {challenge.inventory && (
        <CodeBlock data-title="Inventory" data-lang="ini">
          <code>{challenge.inventory}</code>
        </CodeBlock>
      )}
      {challenge.type === 'choice' ? (
        <AnswerOptions
          options={challenge.options}
          value={challenge.options.indexOf(input)}
          onChange={(index) => {
            setInput(challenge.options[index]);
            setFeedback(null);
          }}
        />
      ) : (
        <>
          <label className="widget-label" htmlFor={`${uid}-input`}>
            Your {challenge.type === 'yaml' ? 'YAML' : 'answer'}
          </label>
          <CodeEditor
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
      <div className="quiz-foot activity-actions">
        <button className="btn" onClick={check}>
          Check answer
        </button>
        <button className="btn" disabled={hints >= challenge.hints.length} onClick={() => setHints(hints + 1)}>
          Next hint
        </button>
        <button
          className="btn"
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
          <ActivityFeedback correct={feedback.passed} label={feedback.passed ? 'Requirement met.' : 'Try again.'}>
            <Inline text={feedback.feedback} />
          </ActivityFeedback>
        )}
      </div>
      {hints > 0 && (
        <ol className="challenge-hints">
          {challenge.hints.slice(0, hints).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      )}
      <Reveal title="Show an explained solution" open={showSolution} onOpenChange={setShowSolution}>
        <CodeBlock data-lang={challenge.type === 'yaml' ? 'yaml' : 'text'}>
          <code>{solutionFor(challenge)}</code>
        </CodeBlock>
        <p>
          <Inline text={challenge.explain} />
        </p>
      </Reveal>
      <p className="challenge-history">
        {attempts.length} saved attempts · {attempts.filter((a) => a.passed).length} successful. Reading progress is tracked separately.
      </p>
    </ActivityPanel>
  );
}
export default function ChapterPractice({ chapter, challenges: authored = challenges }) {
  return (
    <div className="chapter-practice">
      {authored
        .filter((c) => c.chapter === chapter)
        .map((c) => (
          <Challenge key={c.id} challenge={c} />
        ))}
    </div>
  );
}
