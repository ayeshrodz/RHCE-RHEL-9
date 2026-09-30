import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { Inline } from './inline';

/** Flip cards for active recall. cards: [{ front, back }] */
export default function Flashcards({ cards, title = 'Flashcards' }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[order[pos]];

  const go = (d) => {
    setFlipped(false);
    setPos((p) => (p + d + cards.length) % cards.length);
  };
  const shuffle = () => {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setPos(0);
    setFlipped(false);
  };

  return (
    <section className="flashcards" aria-label={title}>
      <header className="flashcards-head">
        <p className="quiz-title">{title}</p>
        <span className="quiz-score">
          {pos + 1} / {cards.length}
        </span>
      </header>
      <button className={`flashcard ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped((f) => !f)} aria-live="polite">
        <span className="flashcard-side">{flipped ? 'Answer' : 'Prompt'}</span>
        <span className="flashcard-text">
          <Inline text={flipped ? card.back : card.front} />
        </span>
        {!flipped && <span className="flashcard-hint">Click to reveal</span>}
      </button>
      <div className="flashcards-controls">
        <button className="btn btn-sm" onClick={shuffle}>
          <Shuffle size={13} /> Shuffle
        </button>
        <div className="flashcards-nav">
          <button className="btn btn-sm" onClick={() => go(-1)} aria-label="Previous card">
            <ChevronLeft size={14} />
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => go(1)}>
            Next card <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
