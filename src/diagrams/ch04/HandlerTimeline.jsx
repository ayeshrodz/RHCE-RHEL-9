import { useState } from 'react';

// Tasks from the handlers guided exercise. `notify` lists handler names.
const TASKS = [
  { name: 'nginx and php-fpm are installed', notify: [] },
  { name: '/etc/nginx/nginx.conf is deployed', notify: ['restart web service'] },
  { name: '/etc/php-fpm.conf is deployed', notify: ['restart app service'] },
  { name: 'nginx.conf copied again (second notify)', notify: ['restart web service'] },
];
// Handlers run in the order they are listed here, not the order they were notified.
const HANDLERS = ['restart app service', 'restart web service', 'restart database'];

/**
 * Simulate one play run: choose which tasks report changed, optionally make a
 * later task fail, and see which handlers run, how often, and when.
 */
export default function HandlerTimeline() {
  const [changed, setChanged] = useState([false, true, true, true]);
  const [fail, setFail] = useState(false);
  const [force, setForce] = useState(false);

  const notified = new Set();
  const rows = TASKS.map((t, i) => {
    const c = changed[i];
    if (c) t.notify.forEach((h) => notified.add(h));
    return { ...t, status: c ? 'changed' : 'ok', notifies: c ? t.notify : [] };
  });
  if (fail) rows.push({ name: 'Task that fails', status: 'failed', notifies: [] });

  const handlersRun = !fail || force;
  const handlerRows = HANDLERS.map((h) => ({
    name: h,
    status: !notified.has(h) ? 'not notified' : handlersRun ? 'runs once' : 'never runs',
  }));

  return (
    <div className="widget ht">
      <div className="ht-controls">
        <label className="vsub-toggle">
          <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} /> a later task fails
        </label>
        <label className={`vsub-toggle ${fail ? '' : 'is-disabled'}`}>
          <input type="checkbox" checked={force} disabled={!fail} onChange={(e) => setForce(e.target.checked)} /> force_handlers: true
        </label>
      </div>

      <div className="ht-grid">
        <div>
          <p className="widget-label">tasks: click to flip ok / changed</p>
          <ol className="ht-list">
            {rows.map((r, i) => (
              <li key={r.name} className={`ht-row is-${r.status}`}>
                {r.status === 'failed' ? (
                  <span className="ht-status">failed</span>
                ) : (
                  <button
                    className="ht-status"
                    onClick={() => setChanged((c) => c.map((v, j) => (j === i ? !v : v)))}
                    aria-label={`Toggle ${r.name}`}
                  >
                    {r.status}
                  </button>
                )}
                <span className="ht-name">{r.name}</span>
                {TASKS[i]?.notify.length > 0 && (
                  <span className={`ht-notify ${r.notifies.length ? 'is-on' : ''}`}>
                    {r.notifies.length ? 'notifies' : 'would notify'} {TASKS[i].notify.join(', ')}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="widget-label">handlers: run after all tasks</p>
          <ol className="ht-list">
            {handlerRows.map((h) => (
              <li key={h.name} className={`ht-row is-${h.status.replace(/ /g, '-')}`}>
                <span className="ht-status">{h.status}</span>
                <span className="ht-name">{h.name}</span>
              </li>
            ))}
          </ol>
          <p className="ht-explain">
            {fail && !force
              ? 'The play failed on this host, so notified handlers are dropped. Set force_handlers: true to run them anyway.'
              : fail && force
                ? 'force_handlers makes already-notified handlers run even though the play failed.'
                : notified.size
                  ? 'Each notified handler runs exactly once, in the order of the handlers section, even if several tasks notified it.'
                  : 'Nothing changed, so no handler was notified and none run.'}
          </p>
        </div>
      </div>
    </div>
  );
}
