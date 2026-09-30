import { useMemo, useState } from 'react';
import { groupsOf, hostsOf, parseInventory } from '@/lib/inventory';

const INVENTORY = `[webservers]
servera.lab.example.com
web-alias ansible_host=serverb.lab.example.com

[dbservers]
serverc.lab.example.com

[production:children]
webservers
dbservers
`;

// What setup would report as the real fully qualified name of each host.
const FQDN = {
  'servera.lab.example.com': 'servera.lab.example.com',
  'web-alias': 'serverb.lab.example.com',
  'serverc.lab.example.com': 'serverc.lab.example.com',
};

/** Pick the host a task is running on and see the magic variables Ansible gives it. */
export default function MagicVariables() {
  const inv = useMemo(() => parseInventory(INVENTORY), []);
  const [host, setHost] = useState('web-alias');
  const groupNames = groupsOf(inv, host).filter((g) => g !== 'all');
  const groups = Object.fromEntries(
    ['all', ...[...inv.groups.keys()].sort()].map((g) => [g, g === 'all' ? inv.allHosts : hostsOf(inv, g)]),
  );
  const vars = inv.hostVars.get(host) ?? {};

  const rows = [
    ['inventory_hostname', JSON.stringify(host), 'The name of this host as written in the inventory.'],
    [
      "ansible_facts['fqdn']",
      JSON.stringify(FQDN[host]),
      'The name the host reports about itself. It can differ from the inventory name, as it does for web-alias.',
    ],
    [
      'group_names',
      JSON.stringify(groupNames),
      'Every group this host belongs to, directly or through a parent group (all is not listed).',
    ],
    [
      'groups',
      JSON.stringify(groups, null, 1).replace(/\n\s*/g, ' '),
      'Every group in the inventory and its hosts. The same for every host.',
    ],
    [
      `hostvars['${host}']`,
      JSON.stringify(vars),
      "This host's variables. Other hosts can read it too, e.g. hostvars['serverc.lab.example.com'], and after facts are gathered it also holds that host's facts.",
    ],
  ];

  return (
    <div className="widget mv">
      <div className="mv-top">
        <pre className="terminal mv-inv">{INVENTORY.trim()}</pre>
        <div>
          <p className="widget-label">The task is running on</p>
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
