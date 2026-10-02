import { useState } from 'react';
import ProjectTree from './ProjectTree';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('GroupVarsResolver', (copy) => {
  const FILES = copy.data.files;

  const HOSTS = copy.data.hosts;

  const PATHS = ['ansible.cfg', ...Object.keys(FILES), 'inventory', 'playbook.yml'];

  function GroupVarsResolver() {
    const [host, setHost] = useState(copy.data.initialSelection1);
    const [present, setPresent] = useState(() => new Set(Object.keys(FILES).filter((f) => !f.startsWith('host_vars'))));

    const applies = (path) => {
      const f = FILES[path];
      return f.host ? f.host === host : HOSTS[host].includes(f.group);
    };
    const chain = Object.keys(FILES)
      .filter((p) => present.has(p) && applies(p))
      .sort((a, b) => FILES[b].rank - FILES[a].rank);
    const winner = chain[0];

    const toggle = (path) =>
      FILES[path] &&
      setPresent((s) => {
        const n = new Set(s);
        n.has(path) ? n.delete(path) : n.add(path);
        return n;
      });

    const notes = Object.fromEntries(
      Object.keys(FILES).map((p) => [p, present.has(p) ? formatCopy(copy.text.template, [FILES[p].value]) : copy.text.label]),
    );

    return (
      <div className="widget gvr">
        <div className="gvr-hosts">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="chip-row">
            {Object.keys(HOSTS).map((h) => (
              <button key={h} className={`chip ${h === host ? 'is-active' : ''}`} onClick={() => setHost(h)}>
                {h.split('.')[0]}
              </button>
            ))}
          </div>
          <p className="gvr-membership">
            <code>{host.split('.')[0]}</code>
            {copy.text.gvrMembership}
            <code>{HOSTS[host][1]}</code>
            {copy.text.gvrMembership2}
            <code>{copy.text.code}</code>
            {copy.text.gvrMembership3}
          </p>
        </div>

        <div className="gvr-grid">
          <ProjectTree
            paths={PATHS}
            onSelect={toggle}
            highlight={winner ? [winner] : []}
            dim={Object.keys(FILES).filter((p) => !present.has(p) || !applies(p))}
            notes={notes}
            caption={copy.text.caption}
          />
          <div className="gvr-chain" aria-live="polite">
            <p className="widget-label">
              {copy.text.widgetLabel2}
              {host.split('.')[0]}
              {copy.text.widgetLabel3}
            </p>
            {chain.length === 0 && <p className="term-muted">{copy.text.termMuted}</p>}
            <ol>
              {chain.map((p, i) => (
                <li key={p} className={i === 0 ? 'is-winner' : 'is-overridden'}>
                  <code>{p}</code>
                  <span>
                    {FILES[p].kind}
                    {copy.text.span}
                    <strong>{FILES[p].value}</strong>
                  </span>
                </li>
              ))}
            </ol>
            {winner && (
              <p className="gvr-answer">
                <code>{copy.text.label2}</code>
                {copy.text.gvrAnswer}
                <strong>{FILES[winner].value}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return GroupVarsResolver;
});
