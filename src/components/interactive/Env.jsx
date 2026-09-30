// Classroom vs home-lab instructions. The reader's choice is one site-wide
// preference, so switching it on any page switches every <Env> block.
import { Children, isValidElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, House, School, WandSparkles } from 'lucide-react';
import { ENVS, useLabEnv } from '@/lib/labEnv';

const icons = { classroom: School, home: House };

export function EnvSwitch({ label = 'Show commands for' }) {
  const [env, setEnv] = useLabEnv();
  return (
    <div className="env-switch" role="tablist" aria-label={label}>
      {ENVS.map(({ id, label: text }) => {
        const Icon = icons[id];
        return (
          <button key={id} role="tab" aria-selected={env === id} className={env === id ? 'is-active' : ''} onClick={() => setEnv(id)}>
            <Icon size={13} /> {text}
          </button>
        );
      })}
    </div>
  );
}

/**
 * <Env>
 *   <Classroom>…what the book does…</Classroom>
 *   <HomeLab>…what to do on the Chapter 0 lab…</HomeLab>
 * </Env>
 */
export function Env({ children }) {
  const [env] = useLabEnv();
  const wanted = env === 'home' ? HomeLab : Classroom;
  const panel = Children.toArray(children).find((c) => isValidElement(c) && c.type === wanted);
  return (
    <div className={`env env-${env}`}>
      <EnvSwitch />
      <div className="env-panel">{panel ? panel.props.children : <p className="env-same">Same as the other environment.</p>}</div>
    </div>
  );
}

/** Only meaningful inside <Env>. */
export function Classroom({ children }) {
  return children;
}

/** Inside <Env>: the home-lab panel. On its own: an always-visible note for home-lab readers. */
export function HomeLab({ title = 'On the home lab', children }) {
  return (
    <aside className="callout callout-homelab">
      <div className="callout-icon">
        <House size={16} />
      </div>
      <div className="callout-body">
        <p className="callout-title">{title}</p>
        {children}
      </div>
    </aside>
  );
}

function parseManifest(text) {
  const files = [];
  let hook = false;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    if (line.startsWith('@')) hook = true;
    else {
      const [dest, src = dest] = line.split('=');
      files.push({ dest, src });
    }
  }
  return { files, hook };
}

/** Lists what the home-lab `lab start NAME` creates; click a file to read it. */
export function StarterFiles({ name }) {
  const [manifest, setManifest] = useState(null);
  const [open, setOpen] = useState(null);
  const [body, setBody] = useState('');
  const base = `${import.meta.env.BASE_URL}lab/${name}/`;

  useEffect(() => {
    let alive = true;
    setManifest(null);
    setOpen(null);
    fetch(`${base}MANIFEST`)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((t) => alive && setManifest(t.trimStart().startsWith('<') ? false : parseManifest(t)))
      .catch(() => alive && setManifest(false));
    return () => {
      alive = false;
    };
  }, [base]);

  const show = (file) => {
    if (open === file.dest) return setOpen(null);
    setOpen(file.dest);
    setBody('Loading…');
    fetch(base + file.src)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then(setBody)
      .catch(() => setBody('Could not load this file.'));
  };

  if (manifest === null) return null;
  if (manifest === false) return <p className="starter-none">The starter files for this exercise are not published yet.</p>;
  if (!manifest.files.length && !manifest.hook)
    return <p className="starter-none">An empty project folder: you write every file yourself.</p>;

  return (
    <div className="starter">
      <ul className="starter-files">
        {manifest.files.map((f) => (
          <li key={f.dest}>
            <button className={open === f.dest ? 'is-active' : ''} onClick={() => show(f)} aria-expanded={open === f.dest}>
              <FileText size={12} /> {f.dest}
            </button>
          </li>
        ))}
        {manifest.hook && (
          <li
            className="starter-hook"
            title="Some files are generated on your workstation, for example certificates or Vault-encrypted files"
          >
            <WandSparkles size={12} /> plus generated files
          </li>
        )}
      </ul>
      {open && (
        <pre className="starter-view" tabIndex={0}>
          <code>{body}</code>
        </pre>
      )}
    </div>
  );
}

/** The "Finish" step of an exercise, for both environments. */
export function Finish({ name, grade = false }) {
  return (
    <Env>
      <Classroom>
        <p>
          On workstation, {grade && 'grade your work, then '}clean up so this exercise does not affect the next one:{' '}
          {grade && (
            <>
              <code>lab grade {name}</code>, then{' '}
            </>
          )}
          <code>lab finish {name}</code>.
        </p>
      </Classroom>
      <HomeLab>
        <p>
          On the Ubuntu host, run <code>rht-vmctl reset servers</code> to put every managed host back to the clean baseline. Your project
          stays in <code>~/{name}</code> on workstation; <code>lab finish {name}</code> there just reminds you of this.
          {grade && (
            <>
              {' '}
              There is no <code>lab grade</code> at home: use the checks in the last tasks, and run the playbook a second time to confirm{' '}
              <code>changed=0</code>.
            </>
          )}
        </p>
      </HomeLab>
    </Env>
  );
}

/** Inside <Lab>: extra home-lab preparation notes, shown in the Home lab tab of the exercise header. */
export function HomeSetup({ children }) {
  return children;
}

export function LabPrep({ name, classroom, starter, extra }) {
  const [env] = useLabEnv();
  return (
    <div className={`env env-${env} lab-prep`}>
      <div className="lab-prep-head">
        <p className="lab-meta-label">Before you begin</p>
        <EnvSwitch />
      </div>
      <div className="env-panel">
        {env === 'classroom' ? (
          <p>
            As <code>student</code> on workstation, run <code>{classroom}</code>. It creates <code>~/{name}</code> with the exercise's
            starter files and prepares the managed hosts.
          </p>
        ) : (
          <>
            <ol className="lab-prep-steps">
              <li>
                On the Ubuntu host: <code>rht-vmctl reset servers</code> (start from clean machines).
              </li>
              {starter && (
                <li>
                  On workstation: <code>{classroom}</code>, the same command as the book. The{' '}
                  <Link to="/ch00/control-node">home-lab version of lab</Link> creates <code>~/{name}</code> with these starter files:
                  <StarterFiles name={name} />
                </li>
              )}
            </ol>
            {extra}
          </>
        )}
      </div>
    </div>
  );
}
