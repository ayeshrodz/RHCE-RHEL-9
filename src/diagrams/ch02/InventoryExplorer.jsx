import CodeEditor from '@/components/interactive/CodeEditor';
import { useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { graph, groupsOf, hostsOf, parseInventory } from '@/lib/inventory';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('InventoryExplorer', (copy) => {
  const SAMPLE = copy.data.sample;

  const TONES = ['purple', 'teal', 'coral', 'blue', 'amber', 'pink', 'green'];

  function InventoryExplorer({ initial = SAMPLE }) {
    const [text, setText] = useState(initial);
    const [group, setGroup] = useState(copy.data.initialSelection1);
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
              <p className="widget-label">{copy.text.widgetLabel}</p>
              {text !== initial && (
                <button className="btn btn-sm btn-ghost" onClick={() => setText(initial)}>
                  <RotateCcw size={12} />
                  {copy.text.btn}
                </button>
              )}
            </div>
            <CodeEditor value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label={copy.text.label} />
          </div>

          <div className="inv-view">
            <p className="widget-label">{copy.text.widgetLabel2}</p>
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

            <p className="widget-label inv-hosts-label">{copy.text.widgetLabel3}</p>
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
              {inv.allHosts.length === 0 && <span className="term-muted">{copy.text.termMuted}</span>}
            </div>

            <p className="widget-label inv-hosts-label">{host ? copy.text.label2 : 'Output'}</p>
            {host ? (
              <div className="terminal">
                <p className="term-muted">
                  {host}
                  {copy.text.termMuted2}
                </p>
                {hostGroups.map((g) => (
                  <p key={g}>
                    {' '}
                    {g === 'all' ? copy.text.label3 : inv.groups.get(g)?.hosts.has(host) ? g : formatCopy(copy.text.template, [g])}
                  </p>
                ))}
              </div>
            ) : (
              <div className="terminal">
                <p className="term-muted">
                  {copy.text.termMuted3}
                  {selectedGroup}
                </p>
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
  return InventoryExplorer;
});
