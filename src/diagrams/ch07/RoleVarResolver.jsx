import { useState } from 'react';

// Lowest to highest, as measured with ansible-core 2.14.
const SOURCES = [
  {
    id: 'defaults',
    where: "the role's defaults/main.yml",
    code: 'roles/web_site/defaults/main.yml',
    value: 'Welcome',
    note: 'Meant to be overridden.',
  },
  { id: 'inventory', where: 'inventory (group_vars or host_vars)', code: 'group_vars/web.yml', value: 'Team site' },
  { id: 'play', where: 'vars in the play', code: 'vars: in site.yml', value: 'Staff intranet' },
  { id: 'entry', where: 'vars on the role entry', code: '- role: web_site\n  vars:', value: 'Intranet (role entry)' },
  {
    id: 'rolevars',
    where: "the role's vars/main.yml",
    code: 'roles/web_site/vars/main.yml',
    value: 'Fixed by the role',
    note: 'Beats everything above: inventory and play variables cannot change it.',
  },
  { id: 'param', where: 'an inline role parameter', code: '- role: web_site\n  web_site_title: …', value: 'Inline parameter' },
  { id: 'extra', where: '-e on the command line', code: '-e web_site_title=…', value: 'From the command line', note: 'Always wins.' },
];

/** Set the same role variable in several places and see which value the role uses. */
export default function RoleVarResolver() {
  const [on, setOn] = useState({ defaults: true, inventory: false, play: true });
  const active = SOURCES.filter((s) => on[s.id]);
  const winner = active[active.length - 1];

  return (
    <div className="widget rvr">
      <p className="widget-label">Which value does the role use?</p>
      <p className="widget-sub">
        Tick every place where <code>web_site_title</code> is set. The list runs from lowest precedence to highest.
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
            The role uses <code>{winner.value}</code>, from {winner.where}. {winner.note}
          </>
        ) : (
          <>
            The variable is not set anywhere: the first task that uses it fails with <code>'web_site_title' is undefined</code>.
          </>
        )}
      </p>
    </div>
  );
}
