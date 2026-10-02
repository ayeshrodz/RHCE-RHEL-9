import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('HandlerTimeline', (copy) => {
  const TASKS = copy.data.tasks;

  const HANDLERS = copy.data.handlers;

  function HandlerTimeline() {
    const [changed, setChanged] = useState([false, true, true, true]);
    const [fail, setFail] = useState(false);
    const [force, setForce] = useState(false);

    const notified = new Set();
    const rows = TASKS.map((t, i) => {
      const c = changed[i];
      if (c) t.notify.forEach((h) => notified.add(h));
      return { ...t, status: c ? 'changed' : 'ok', notifies: c ? t.notify : [] };
    });
    if (fail) rows.push({ name: copy.text.name, status: 'failed', notifies: [] });

    const handlersRun = !fail || force;
    const handlerRows = HANDLERS.map((h) => ({
      name: h,
      status: !notified.has(h) ? copy.text.label : handlersRun ? copy.text.label2 : copy.text.label3,
    }));

    return (
      <div className="widget ht">
        <div className="ht-controls">
          <label className="vsub-toggle">
            <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} />
            {copy.text.vsubToggle}
          </label>
          <label className={`vsub-toggle ${fail ? '' : 'is-disabled'}`}>
            <input type="checkbox" checked={force} disabled={!fail} onChange={(e) => setForce(e.target.checked)} />
            {copy.text.label4}
          </label>
        </div>

        <div className="ht-grid">
          <div>
            <p className="widget-label">{copy.text.widgetLabel}</p>
            <ol className="ht-list">
              {rows.map((r, i) => (
                <li key={r.name} className={`ht-row is-${r.status}`}>
                  {r.status === 'failed' ? (
                    <span className="ht-status">{copy.text.htStatus}</span>
                  ) : (
                    <button
                      className="ht-status"
                      onClick={() => setChanged((c) => c.map((v, j) => (j === i ? !v : v)))}
                      aria-label={formatCopy(copy.text.template, [r.name])}
                    >
                      {r.status}
                    </button>
                  )}
                  <span className="ht-name">{r.name}</span>
                  {TASKS[i]?.notify.length > 0 && (
                    <span className={`ht-notify ${r.notifies.length ? 'is-on' : ''}`}>
                      {r.notifies.length ? 'notifies' : copy.text.label5} {TASKS[i].notify.join(', ')}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="widget-label">{copy.text.widgetLabel2}</p>
            <ol className="ht-list">
              {handlerRows.map((h) => (
                <li key={h.name} className={`ht-row is-${h.status.replace(/ /g, '-')}`}>
                  <span className="ht-status">{h.status}</span>
                  <span className="ht-name">{h.name}</span>
                </li>
              ))}
            </ol>
            <p className="ht-explain">
              {fail && !force ? copy.text.label6 : fail && force ? copy.text.label7 : notified.size ? copy.text.label8 : copy.text.label9}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return HandlerTimeline;
});
