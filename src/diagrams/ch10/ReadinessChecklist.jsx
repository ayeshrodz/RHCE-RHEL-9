import { useState } from 'react';
import { Link } from 'react-router-dom';
import { chapters } from '@/lib/course';
import { useStored } from '@/lib/storage';

const LEVELS = [
  { label: 'Not yet', tone: 'no' },
  { label: 'Shaky', tone: 'shaky' },
  { label: 'Confident', tone: 'yes' },
];

// Which review lab exercises each chapter most.
const LABS = {
  lab_deploy: { path: '/ch10/lab-review-deploy', label: '10.2 Deploying Ansible' },
  lab_playbooks: { path: '/ch10/lab-review-playbooks', label: '10.3 Creating playbooks' },
  lab_admin: { path: '/ch10/lab-review-admin', label: '10.4 Managing hosts' },
  lab_roles: { path: '/ch10/lab-review-roles', label: '10.5 Creating roles' },
};
const PRACTICE = {
  1: ['lab_deploy'],
  2: ['lab_deploy', 'lab_playbooks'],
  3: ['lab_deploy', 'lab_playbooks'],
  4: ['lab_playbooks'],
  5: ['lab_playbooks', 'lab_roles'],
  6: ['lab_admin'],
  7: ['lab_admin', 'lab_roles'],
  8: ['lab_deploy', 'lab_playbooks', 'lab_admin', 'lab_roles'],
  9: ['lab_admin'],
};

const reviewed = chapters.filter((c) => c.number >= 1 && c.number <= 9 && c.objectives.length > 0);

/** Rate every objective of chapters 1–9 and see which chapters and review labs to go back to. */
export default function ReadinessChecklist() {
  const [ratings, setRatings] = useStored('readiness', {});
  const [open, setOpen] = useState(reviewed[0]?.id);
  const chapter = reviewed.find((c) => c.id === open) ?? reviewed[0];

  const key = (c, i) => `${c.id}:${i}`;
  const rate = (k, level) =>
    setRatings((old) => {
      const next = { ...old };
      if (next[k] === level) delete next[k];
      else next[k] = level;
      return next;
    });

  const all = reviewed.flatMap((c) => c.objectives.map((_, i) => ratings[key(c, i)]));
  const total = all.length;
  const rated = all.filter((v) => v !== undefined).length;
  const confident = all.filter((v) => v === 2).length;
  const summary = (c) => {
    const vals = c.objectives.map((_, i) => ratings[key(c, i)]);
    const weak = vals.filter((v) => v === 0 || v === 1).length;
    const done = vals.filter((v) => v !== undefined).length;
    const state = done === 0 ? 'unrated' : weak > 0 ? (vals.includes(0) ? 'no' : 'shaky') : done === vals.length ? 'yes' : 'partial';
    return { weak, done, state };
  };
  const toRevisit = reviewed.filter((c) => summary(c).weak > 0);

  if (!chapter) return null;

  return (
    <div className="widget ready">
      <div className="verb-head">
        <p className="widget-label">Readiness checklist</p>
        <span className="ready-score" aria-live="polite">
          {confident} of {total} confident · {rated} rated
        </span>
      </div>

      <div className="ready-bar" aria-hidden="true">
        {reviewed.map((c) =>
          c.objectives.map((_, i) => {
            const v = ratings[key(c, i)];
            return <span key={key(c, i)} className={v === undefined ? '' : `is-${LEVELS[v].tone}`} />;
          }),
        )}
      </div>

      <div className="ready-grid" role="tablist" aria-label="Chapters">
        {reviewed.map((c) => {
          const s = summary(c);
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === chapter.id}
              aria-label={`Chapter ${c.number}: ${c.title}, ${s.done} of ${c.objectives.length} rated`}
              title={c.title}
              className={`ready-tile is-${s.state}${c.id === chapter.id ? ' is-active' : ''}`}
              onClick={() => setOpen(c.id)}
            >
              <span className="ready-num">{c.number}</span>
              <span className="ready-name">{c.title}</span>
              <span className="ready-count">
                {s.done}/{c.objectives.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="ready-panel" role="tabpanel">
        <p className="ready-chapter">
          <Link to={`/${chapter.id}`}>
            Chapter {chapter.number}: {chapter.title}
          </Link>
        </p>
        <ol className="ready-list">
          {chapter.objectives.map((text, i) => {
            const k = key(chapter, i);
            return (
              <li key={k}>
                <p className="ready-obj">{text}</p>
                <div className="segmented" role="group" aria-label="How sure are you?">
                  {LEVELS.map((l, level) => (
                    <button
                      key={l.label}
                      className={`${ratings[k] === level ? `is-active ready-${l.tone}` : ''}`}
                      aria-pressed={ratings[k] === level}
                      onClick={() => rate(k, level)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="ready-advice">
        {rated === 0 ? (
          <p>Rate each objective honestly. Anything marked not yet or shaky shows up here with where to go back to.</p>
        ) : toRevisit.length === 0 ? (
          <p>
            Nothing marked weak. {rated < total ? 'Rate the remaining objectives, then' : 'Now'} prove it: do the four review labs without
            opening the solutions.
          </p>
        ) : (
          <>
            <p>Go back to these before the review labs:</p>
            <ul className="ready-revisit">
              {toRevisit.map((c) => (
                <li key={c.id}>
                  <div>
                    <Link to={`/${c.id}`}>
                      Chapter {c.number}: {c.title}
                    </Link>
                    <span className="ready-weak">{summary(c).weak} weak</span>
                  </div>
                  <div className="ready-labs">
                    <span>then practise in</span>
                    {PRACTICE[c.number].map((id) => (
                      <Link key={id} className="chip" to={LABS[id].path}>
                        {LABS[id].label}
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {rated > 0 && (
          <button className="ready-reset" onClick={() => setRatings({})}>
            Clear my ratings
          </button>
        )}
      </div>
    </div>
  );
}
