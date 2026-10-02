import { useMemo, useState } from 'react';
import { groupsOf, hostsOf, parseInventory } from '@/lib/inventory';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('MagicVariables', (copy) => {
  const INVENTORY = copy.data.inventory;

  const FQDN = copy.data.fqdn;

  function MagicVariables() {
    const inv = useMemo(() => parseInventory(INVENTORY), []);
    const [host, setHost] = useState(copy.data.initialSelection1);
    const groupNames = groupsOf(inv, host).filter((g) => g !== 'all');
    const groups = Object.fromEntries(
      ['all', ...[...inv.groups.keys()].sort()].map((g) => [g, g === 'all' ? inv.allHosts : hostsOf(inv, g)]),
    );
    const vars = inv.hostVars.get(host) ?? {};

    const rows = [
      ['inventory_hostname', JSON.stringify(host), copy.text.label],
      ["ansible_facts['fqdn']", JSON.stringify(FQDN[host]), copy.text.label2],
      ['group_names', JSON.stringify(groupNames), copy.text.label3],
      ['groups', JSON.stringify(groups, null, 1).replace(/\n\s*/g, ' '), copy.text.label4],
      [`hostvars['${host}']`, JSON.stringify(vars), copy.text.label5],
    ];

    return (
      <div className="widget mv">
        <div className="mv-top">
          <pre className="terminal mv-inv">{INVENTORY.trim()}</pre>
          <div>
            <p className="widget-label">{copy.text.widgetLabel}</p>
            <div className="chip-row">
              {inv.allHosts.map((h) => (
                <button key={h} className={`chip ${h === host ? 'is-active' : ''}`} onClick={() => setHost(h)}>
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
        <dl className="mv-list" aria-live="polite">
          {rows.map(([k, v, note]) => (
            <div key={k} className="mv-row">
              <dt>
                <code>{k}</code>
              </dt>
              <dd>
                <code className="mv-value">{v}</code>
                <span>{note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  return MagicVariables;
});
