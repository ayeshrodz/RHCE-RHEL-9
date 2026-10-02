import { Check, X } from 'lucide-react';
import { Inline } from './inline';
const LETTERS = 'ABCDEFG';

/** Selectable answers; a checked quiz can lock choices and show its answer. */
export default function AnswerOptions({ options, value, answer, disabled = false, onChange, label = 'Your answer' }) {
  return (
    <div className="quiz-options" role="group" aria-label={label}>
      {options.map((option, index) => {
        const correct = disabled && index === answer;
        const wrong = disabled && index === value && !correct;
        const state = disabled ? (correct ? 'is-correct' : wrong ? 'is-wrong' : 'is-muted') : index === value ? 'is-selected' : '';
        return (
          <button
            key={index}
            aria-pressed={value === index}
            className={`quiz-option ${state}`}
            disabled={disabled}
            onClick={() => onChange(index)}
          >
            <span className="quiz-letter" aria-hidden="true">
              {correct ? <Check size={13} strokeWidth={3} /> : wrong ? <X size={13} strokeWidth={3} /> : LETTERS[index]}
            </span>
            <span>
              <Inline text={option} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
