import { useState } from 'react';
import ProjectTree from './ProjectTree';

// The two-datacenter project from the course.
const FILES = {
  'group_vars/datacenters': { kind: 'parent group', group: 'datacenters', value: 'httpd', rank: 1 },
  'group_vars/datacenter1': { kind: 'group', group: 'datacenter1', value: 'httpd', rank: 2 },
  'group_vars/datacenter2': { kind: 'group', group: 'datacenter2', value: 'apache', rank: 2 },
  'host_vars/demo1.example.com': { kind: 'host', host: 'demo1.example.com', value: 'httpd', rank: 3 },
  'host_vars/demo2.example.com': { kind: 'host', host: 'demo2.example.com', value: 'apache', rank: 3 },
  'host_vars/demo3.example.com': { kind: 'host', host: 'demo3.example.com', value: 'mariadb-server', rank: 3 },
  'host_vars/demo4.example.com': { kind: 'host', host: 'demo4.example.com', value: 'mysql-server', rank: 3 },
};
const HOSTS = {
  'demo1.example.com': ['datacenters', 'datacenter1'],
  'demo2.example.com': ['datacenters', 'datacenter1'],
  'demo3.example.com': ['datacenters', 'datacenter2'],
  'demo4.example.com': ['datacenters', 'datacenter2'],
};
const PATHS = ['ansible.cfg', ...Object.keys(FILES), 'inventory', 'playbook.yml'];

/**
 * Pick a host and see which group_vars / host_vars files apply to it and which
 * value of `package` wins. Click a file to add or remove it from the project.
 */
export default function GroupVarsResolver() {
  const [host, setHost] = useState('demo3.example.com');
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

  const notes = Object.fromEntries(Object.keys(FILES).map((p) => [p, present.has(p) ? `package: ${FILES[p].value}` : 'not created']));

  return (
    <div className="widget gvr">
      <div className="gvr-hosts">
        <p className="widget-label">Pick a host</p>
        <div className="chip-row">
          {Object.keys(HOSTS).map((h) => (
            <button key={h} className={`chip ${h === host ? 'is-active' : ''}`} onClick={() => setHost(h)}>
              {h.split('.')[0]}
            </button>
          ))}
        </div>
        <p className="gvr-membership">
          <code>{host.split('.')[0]}</code> is in <code>{HOSTS[host][1]}</code>, a child of <code>datacenters</code>.
        </p>
      </div>

      <div className="gvr-grid">
        <ProjectTree
          paths={PATHS}
          onSelect={toggle}
          highlight={winner ? [winner] : []}
          dim={Object.keys(FILES).filter((p) => !present.has(p) || !applies(p))}
          notes={notes}
          caption="Click a group_vars or host_vars file to create or delete it."
        />
        <div className="gvr-chain" aria-live="polite">
          <p className="widget-label">Applies to {host.split('.')[0]}, strongest first</p>
          {chain.length === 0 && <p className="term-muted">No file sets package for this host, so it is undefined.</p>}
          <ol>
            {chain.map((p, i) => (
              <li key={p} className={i === 0 ? 'is-winner' : 'is-overridden'}>
                <code>{p}</code>
                <span>
                  {FILES[p].kind} · <strong>{FILES[p].value}</strong>
                </span>
              </li>
            ))}
          </ol>
          {winner && (
            <p className="gvr-answer">
              <code>{'{{ package }}'}</code> = <strong>{FILES[winner].value}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
