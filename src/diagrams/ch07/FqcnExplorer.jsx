import { useState } from 'react';

const SAMPLES = [
  { name: 'ansible.builtin.copy', kind: 'module', builtin: true },
  { name: 'ansible.posix.firewalld', kind: 'module' },
  { name: 'community.general.parted', kind: 'module' },
  { name: 'community.crypto.openssl_privatekey', kind: 'module' },
  { name: 'redhat.rhel_system_roles.timesync', kind: 'role' },
];

const PATHS = ['./collections', '~/.ansible/collections', '/usr/share/ansible/collections'];

/** Break a fully qualified collection name into its three parts and show where it lives on disk. */
export default function FqcnExplorer() {
  const [value, setValue] = useState(SAMPLES[1].name);
  const sample = SAMPLES.find((s) => s.name === value.trim());
  const parts = value.trim().split('.');
  const valid = parts.length === 3 && parts.every((p) => /^[a-z_][a-z0-9_]*$/.test(p));
  const [ns, coll, item] = parts;
  const kind = sample?.kind ?? 'module';
  const rel = valid ? `ansible_collections/${ns}/${coll}/${kind === 'role' ? `roles/${item}/` : `plugins/modules/${item}.py`}` : '';

  return (
    <div className="widget fq">
      <p className="widget-label">Read a fully qualified collection name</p>
      <div className="chip-row">
        {SAMPLES.map((s) => (
          <button key={s.name} className={`chip ${s.name === value.trim() ? 'is-active' : ''}`} onClick={() => setValue(s.name)}>
            {s.name}
          </button>
        ))}
      </div>
      <input
        className="fq-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        aria-label="Fully qualified collection name"
      />

      {valid ? (
        <>
          <div className="fq-parts" aria-live="polite">
            <div>
              <span className="fq-part t-ns">{ns}</span>
              <em>namespace</em>
              <p>Who publishes it: a vendor, a project or a community.</p>
            </div>
            <div>
              <span className="fq-part t-coll">{coll}</span>
              <em>collection</em>
              <p>The bundle that is installed and versioned as one unit.</p>
            </div>
            <div>
              <span className="fq-part t-item">{item}</span>
              <em>{kind}</em>
              <p>The {kind} inside that collection.</p>
            </div>
          </div>
          {sample?.builtin ? (
            <p className="fq-note">
              <code>ansible.builtin</code> is special: it ships inside <code>ansible-core</code> itself, so it is always available and is
              never installed separately.
            </p>
          ) : (
            <>
              <p className="fq-note">Ansible looks for it in each collections path, in order, and uses the first copy it finds:</p>
              <pre className="terminal fq-paths">{PATHS.map((p, i) => `${i + 1}. ${p}/${rel}`).join('\n')}</pre>
            </>
          )}
        </>
      ) : (
        <p className="fq-note is-bad">
          A fully qualified name has exactly three parts separated by dots: <code>namespace.collection.name</code>, in lower case with
          underscores.
        </p>
      )}
    </div>
  );
}
