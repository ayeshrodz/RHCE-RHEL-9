import { useState } from 'react';
import { Link } from 'react-router-dom';
import { chapters } from '@/lib/course';
import { useStored } from '@/lib/storage';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('ReadinessChecklist', (copy) => {
  const LEVELS = copy.data.levels;

  const LABS = copy.data.labs;

  const PRACTICE = copy.data.practice;

  const reviewed = chapters.filter((c) => c.number >= 1 && c.objectives.length > 0);

  function ReadinessChecklist() {
    const [ratings, setRatings] = useStored('readiness', {});
    const [open, setOpen] = useState(reviewed[0]?.id);
    const chapter = reviewed.find((c) => c.id === open) ?? reviewed[0];

    const key = (c, i) => c.objectiveIds[i];
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
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <span className="ready-score" aria-live="polite">
            {confident}
            {copy.text.readyScore}
            {total}
            {copy.text.readyScore2}
            {rated}
            {copy.text.readyScore3}
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

        <div className="ready-grid" role="tablist" aria-label={copy.text.label}>
          {reviewed.map((c) => {
            const s = summary(c);
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={c.id === chapter.id}
                aria-label={formatCopy(copy.text.template, [c.number, c.title, s.done, c.objectives.length])}
                title={c.title}
                className={`ready-tile is-${s.state}${c.id === chapter.id ? ' is-active' : ''}`}
                onClick={() => setOpen(c.id)}
              >
                <span className="ready-num">{c.number}</span>
                <span className="ready-name">{c.title}</span>
                <span className="ready-count">
                  {s.done}
                  {copy.text.readyCount}
                  {c.objectives.length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ready-panel" role="tabpanel">
          <p className="ready-chapter">
            <Link to={`/${chapter.id}`}>
              {copy.text.link}
              {chapter.number}
              {copy.text.link2}
              {chapter.title}
            </Link>
          </p>
          <ol className="ready-list">
            {chapter.objectives.map((text, i) => {
              const k = key(chapter, i);
              return (
                <li key={k}>
                  <p className="ready-obj">{text}</p>
                  <div className="segmented" role="group" aria-label={copy.text.label2}>
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
            <p>{copy.text.p}</p>
          ) : toRevisit.length === 0 ? (
            <p>
              {copy.text.p2}
              {rated < total ? copy.text.label3 : 'Now'}
              {copy.text.p3}
            </p>
          ) : (
            <>
              <p>{copy.text.p4}</p>
              <ul className="ready-revisit">
                {toRevisit.map((c) => (
                  <li key={c.id}>
                    <div>
                      <Link to={`/${c.id}`}>
                        {copy.text.link3}
                        {c.number}
                        {copy.text.link4}
                        {c.title}
                      </Link>
                      <span className="ready-weak">
                        {summary(c).weak}
                        {copy.text.readyWeak}
                      </span>
                    </div>
                    <div className="ready-labs">
                      <span>{copy.text.span}</span>
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
              {copy.text.readyReset}
            </button>
          )}
        </div>
      </div>
    );
  }
  return ReadinessChecklist;
});
