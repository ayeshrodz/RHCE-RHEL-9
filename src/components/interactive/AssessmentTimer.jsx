import { useEffect, useState } from 'react';
import { useStored } from '@/lib/storage';

export default function AssessmentTimer({ id, minutes = 90 }) {
  const [timer, setTimer] = useStored(`assessment:${id}`, null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timer) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [timer]);
  const seconds = timer ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : null;
  return (
    <section className="assessment-timer widget" aria-label="Optional assessment timer">
      <p>You can practise without a timer or start a {minutes}-minute session. Hints and solutions remain available throughout.</p>
      {timer ? (
        <>
          <p role="timer" aria-label="Time remaining">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')} remaining
          </p>
          <p role="status">
            {seconds === 0
              ? 'Time is up. Review your results and continue learning at your own pace.'
              : 'The timer continues through reloads and while the tab is closed.'}
          </p>
          <button className="btn" onClick={() => setTimer(null)}>
            End timed session
          </button>
        </>
      ) : (
        <button
          className="btn"
          onClick={() => {
            const started = Date.now();
            setNow(started);
            setTimer({ endsAt: started + minutes * 60_000 });
          }}
        >
          Start {minutes}-minute timer
        </button>
      )}
    </section>
  );
}
