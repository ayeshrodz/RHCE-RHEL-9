import { useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { graph, groupsOf, hostsOf, parseInventory } from '@/lib/inventory';

const SAMPLE = `[webservers]
server[a:d].lab.example.com

[raleigh]
servera.lab.example.com
serverb.lab.example.com

[mountainview]
serverc.lab.example.com

[london]
serverd.lab.example.com

[development]
servera.lab.example.com

[testing]
serverb.lab.example.com

[production]
serverc.lab.example.com
serverd.lab.example.com

[us:children]
raleigh
mountainview
`;

const TONES = ['purple', 'teal', 'coral', 'blue', 'amber', 'pink', 'green'];

/**
 * Edit an INI inventory and explore it the way `ansible-navigator inventory`
 * would: pick a group to see its graph, or a host to see its groups.
 */
export default function InventoryExplorer({ initial = SAMPLE }) {
  const [text, setText] = useState(initial);
  const [group, setGroup] = useState('us');
  const [host, setHost] = useState(null);
  const inv = useMemo(() => parseInventory(text), [text]);

  const groupNames = ['all', ...[...inv.groups.keys()].filter((g) => g !== 'ungrouped').sort(), 'ungrouped'];
  const tone = (name) => (name === 'all' || name === 'ungrouped' ? 'gray' : TONES[groupNames.indexOf(name) % TONES.length]);
  const selectedGroup = inv.groups.has(group) || group === 'all' ? group : 'all';
  const members = hostsOf(inv, selectedGroup);
  const hostGroups = host && inv.allHosts.includes(host) ? groupsOf(inv, host) : null;

  return (
    <div className="widget inv">
      <div className="inv-grid">
        <div className="inv-editor">
          <div className="inv-editor-head">
            <p className="widget-label">inventory (editable)</p>
            {text !== initial && (
              <button className="btn btn-sm btn-ghost" onClick={() => setText(initial)}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label="Inventory file" />
        </div>

        <div className="inv-view">
          <p className="widget-label">Groups: pick one</p>
          <div className="chip-row">
            {groupNames.map((g) => (
              <button
                key={g}
                className={`chip t-${tone(g)} ${selectedGroup === g && !host ? 'is-active' : ''} ${hostGroups && !hostGroups.includes(g) ? 'is-dim' : ''}`}
                onClick={() => {
                  setGroup(g);
                  setHost(null);
                }}
              >
                {g}
              </button>
            ))}
          </div>

          <p className="widget-label inv-hosts-label">Hosts: pick one to see its groups</p>
          <div className="chip-row">
            {inv.allHosts.map((h) => (
              <button
                key={h}
                className={`chip ${host === h ? 'is-active' : ''} ${!host && !members.includes(h) ? 'is-dim' : ''}`}
                onClick={() => setHost(host === h ? null : h)}
              >
                {h.replace('.lab.example.com', '')}
              </button>
            ))}
            {inv.allHosts.length === 0 && <span className="term-muted">No hosts yet.</span>}
          </div>

          <p className="widget-label inv-hosts-label">{host ? 'Member of' : 'Output'}</p>
          {host ? (
            <div className="terminal">
              <p className="term-muted">{host} is in:</p>
              {hostGroups.map((g) => (
                <p key={g}>
                  {' '}
                  {g === 'all' ? 'all  (every host is)' : inv.groups.get(g)?.hosts.has(host) ? g : `${g}  (via a child group)`}
                </p>
              ))}
            </div>
          ) : (
            <div className="terminal">
              <p className="term-muted">$ ansible-navigator inventory -i inventory -m stdout --graph {selectedGroup}</p>
              <p>{graph(inv, selectedGroup)}</p>
            </div>
          )}
        </div>
      </div>

      {inv.warnings.length > 0 && (
        <ul className="inv-warnings">
          {inv.warnings.slice(0, 3).map((w) => (
            <li key={w}>
              <AlertTriangle size={13} /> {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
