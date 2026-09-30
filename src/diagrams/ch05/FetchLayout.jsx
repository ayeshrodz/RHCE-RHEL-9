import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const HOSTS = ['servera.lab.example.com', 'serverb.lab.example.com'];

/** Where fetch stores files on the control node, with flat off (the default) and on. */
export default function FetchLayout() {
  const [flat, setFlat] = useState(false);
  const tree = flat
    ? `secure-backups/
└── secure          ← ${HOSTS.length} hosts wrote this one file`
    : `secure-backups/
${HOSTS.map((h, i) => {
  const last = i === HOSTS.length - 1;
  const bar = last ? ' ' : '│';
  return `${last ? '└' : '├'}── ${h}/
${bar}   └── var/
${bar}       └── log/
${bar}           └── secure`;
}).join('\n')}`;

  return (
    <div className="widget fetch">
      <div className="verb-head">
        <p className="widget-label">Where fetched files land</p>
        <div className="segmented" role="radiogroup" aria-label="flat option">
          <button role="radio" aria-checked={!flat} className={!flat ? 'is-active' : ''} onClick={() => setFlat(false)}>
            flat: false
          </button>
          <button role="radio" aria-checked={flat} className={flat ? 'is-active' : ''} onClick={() => setFlat(true)}>
            flat: true
          </button>
        </div>
      </div>
      <div className="fetch-grid">
        <pre className="terminal">{`- name: Fetch the secure log
  ansible.builtin.fetch:
    src: /var/log/secure
    dest: secure-backups${flat ? '/' : ''}
    flat: ${flat}`}</pre>
        <pre className="terminal" aria-live="polite">
          {tree}
        </pre>
      </div>
      {flat ? (
        <p className="fetch-note is-warn">
          <AlertTriangle size={14} />
          <span>
            With <code>flat: true</code> every host's file is saved under the same name, so each one overwrites the last. Put the host name
            in <code>dest</code> yourself, for example <code>{'dest: "secure-backups/{{ inventory_hostname }}-secure"'}</code>.
          </span>
        </p>
      ) : (
        <p className="fetch-note">
          <span>
            The default adds the host name and the file's full path under <code>dest</code>, so files from different hosts never collide.
          </span>
        </p>
      )}
    </div>
  );
}
