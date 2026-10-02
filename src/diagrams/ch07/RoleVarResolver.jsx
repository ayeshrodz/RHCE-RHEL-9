import { useState } from 'react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('RoleVarResolver', (copy) => {
  const SOURCES = copy.data.sources;

  function RoleVarResolver() {
    const [on, setOn] = useState({ defaults: true, inventory: false, play: true });
    const active = SOURCES.filter((s) => on[s.id]);
    const winner = active[active.length - 1];

    return (
      <div className="widget rvr">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <p className="widget-sub">
          {copy.text.widgetSub}
          <code>{copy.text.code}</code>
          {copy.text.widgetSub2}
        </p>
        <ol className="rvr-list">
          {SOURCES.map((s) => {
            const isWinner = winner?.id === s.id;
            return (
              <li key={s.id} className={`${on[s.id] ? 'is-on' : ''} ${isWinner ? 'is-winner' : ''}`}>
                <label>
                  <input type="checkbox" checked={Boolean(on[s.id])} onChange={() => setOn((o) => ({ ...o, [s.id]: !o[s.id] }))} />
                  <span className="rvr-where">{s.where}</span>
                </label>
                <code className="rvr-value">{s.value}</code>
                <span className="rvr-status">{isWinner ? 'wins' : on[s.id] ? 'overridden' : ''}</span>
              </li>
            );
          })}
        </ol>
        <p className="rvr-result" aria-live="polite">
          {winner ? (
            <>
              {copy.text.rvrResult}
              <code>{winner.value}</code>
              {copy.text.rvrResult2}
              {winner.where}
              {copy.text.rvrResult3}
              {winner.note}
            </>
          ) : (
            <>
              {copy.text.rvrResult4}
              <code>{copy.text.code2}</code>
              {copy.text.rvrResult5}
            </>
          )}
        </p>
      </div>
    );
  }
  return RoleVarResolver;
});
