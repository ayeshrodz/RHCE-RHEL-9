import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const MODES = {
  list: {
    label: 'list of strings',
    items: ['postfix', 'dovecot'],
    render: (items) => `- name: Postfix and Dovecot are running
  ansible.builtin.service:
    name: "{{ item }}"
    state: started
  loop:
${items.map((i) => `    - ${i}`).join('\n')}`,
    expand: (item) => ({ label: item, detail: `service name=${item} state=started` }),
  },
  dicts: {
    label: 'list of dictionaries',
    items: ['jane:wheel', 'joe:root'],
    render: (items) => `- name: Users exist and are in the correct groups
  ansible.builtin.user:
    name: "{{ item['name'] }}"
    state: present
    groups: "{{ item['groups'] }}"
  loop:
${items
  .map((i) => {
    const [n, g = ''] = i.split(':');
    return `    - name: ${n}\n      groups: ${g}`;
  })
  .join('\n')}`,
    expand: (item) => {
      const [n, g = ''] = item.split(':');
      return { label: `{'name': '${n}', 'groups': '${g}'}`, detail: `user name=${n} groups=${g}` };
    },
  },
};

/** Edit a loop's list and see the one task become one run per item. */
export default function LoopUnroller() {
  const [mode, setMode] = useState('list');
  const [items, setItems] = useState(MODES.list.items);
  const [draft, setDraft] = useState('');
  const m = MODES[mode];

  const switchMode = (k) => {
    setMode(k);
    setItems(MODES[k].items);
    setDraft('');
  };
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems((l) => [...l, v]);
    setDraft('');
  };

  return (
    <div className="widget lu">
      <div className="verb-head">
        <p className="widget-label">One task, many runs</p>
        <div className="segmented" role="radiogroup" aria-label="Loop list type">
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} role="radio" aria-checked={mode === k} className={mode === k ? 'is-active' : ''} onClick={() => switchMode(k)}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lu-grid">
        <div>
          <pre className="terminal lu-yaml">{m.render(items)}</pre>
          <div className="lu-items">
            {items.map((it, i) => (
              <span key={`${it}-${i}`} className="lu-chip">
                {it}
                <button aria-label={`Remove ${it}`} onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <form
              className="lu-add"
              onSubmit={(e) => {
                e.preventDefault();
                add();
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={mode === 'list' ? 'add a service' : 'name:group'}
                aria-label="New loop item"
                spellCheck={false}
              />
              <button type="submit" className="btn btn-sm" aria-label="Add item">
                <Plus size={13} />
              </button>
            </form>
          </div>
        </div>

        <div>
          <p className="widget-label">What Ansible does</p>
          <ol className="lu-runs">
            {items.map((it, i) => {
              const x = m.expand(it);
              return (
                <li key={`${it}-${i}`}>
                  <span className="lu-n">{i + 1}</span>
                  <span>
                    <code>item = {x.label}</code>
                    <span className="lu-detail">{x.detail}</span>
                  </span>
                </li>
              );
            })}
            {items.length === 0 && <li className="term-muted">Empty list: the task is skipped.</li>}
          </ol>
          <pre className="terminal lu-out">
            {`TASK [${mode === 'list' ? 'Postfix and Dovecot are running' : 'Users exist and are in the correct groups'}] ****\n`}
            {items.map((it) => `changed: [servera] => (item=${m.expand(it).label})\n`).join('')}
          </pre>
        </div>
      </div>
    </div>
  );
}
