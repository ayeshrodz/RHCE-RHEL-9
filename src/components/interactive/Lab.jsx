import { Children, cloneElement, createContext, isValidElement, useContext } from 'react';
import { Check, FlaskConical, PartyPopper, Server } from 'lucide-react';
import { useStored } from '@/lib/storage';
import { usePageKey } from '@/lib/pageContext';
import { exerciseName } from '@/lib/labEnv';
import { HomeSetup, LabPrep } from './Env';

const LabContext = createContext(null);
const EMPTY = [];

/**
 * Hands-on exercise with persisted task checkboxes.
 * <Lab id="inventory" outcomes={[...]} classroom="lab start playbook-inventory" hosts={[...]}>
 *   <HomeSetup>optional extra notes for the home lab</HomeSetup>
 *   <Task title="...">...</Task>
 * </Lab>
 * `starter={false}` for exercises that have no starter project (nothing for `lab start` to create at home).
 * `own` for exercises that exist only in this guide (no classroom equivalent).
 */
export function Lab({
  id = 'lab',
  title = 'Hands-on exercise',
  outcomes = [],
  classroom,
  starter = true,
  own = false,
  hosts = [],
  children,
}) {
  const pageKey = usePageKey();
  const [done, setDone] = useStored(`lab:${pageKey}:${id}`, EMPTY);

  let n = 0;
  const homeSetup = [];
  const numbered = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === HomeSetup) {
      homeSetup.push(child.props.children);
      return null;
    }
    return isValidElement(child) && child.type === Task ? cloneElement(child, { n: ++n }) : child;
  });
  const total = n;
  const count = done.filter((i) => i <= total).length;
  const pct = total ? Math.round((count / total) * 100) : 0;

  const toggle = (i) => setDone((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]));

  return (
    <LabContext.Provider value={{ done, toggle }}>
      <section className="lab">
        <header className="lab-head">
          <div className="lab-title-row">
            <span className="lab-icon">
              <FlaskConical size={16} />
            </span>
            <p className="lab-title">{title}</p>
            <span className="lab-count">
              {count}/{total} tasks
            </span>
          </div>
          <div className="lab-progress" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>

          <div className="lab-meta">
            {outcomes.length > 0 && (
              <div>
                <p className="lab-meta-label">You will be able to</p>
                <ul>
                  {outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            )}
            {hosts.length > 0 && (
              <div>
                <p className="lab-meta-label">Machines</p>
                <ul className="lab-hosts">
                  {hosts.map((h) => (
                    <li key={h}>
                      <Server size={12} /> <code>{h}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {classroom && (
            <LabPrep
              name={exerciseName(classroom)}
              classroom={classroom}
              starter={starter}
              own={own}
              extra={homeSetup.length > 0 ? <div className="lab-prep-extra">{homeSetup}</div> : null}
            />
          )}
        </header>

        <ol className="lab-tasks">{numbered}</ol>

        {total > 0 && count === total && (
          <footer className="lab-done">
            <PartyPopper size={16} /> All tasks complete. Run through it once more from memory for exam speed.
          </footer>
        )}
      </section>
    </LabContext.Provider>
  );
}

export function Task({ n, title, children }) {
  const { done, toggle } = useContext(LabContext);
  const checked = done.includes(n);
  return (
    <li className={`lab-task ${checked ? 'is-done' : ''}`}>
      <div className="lab-task-head">
        <button
          className="lab-check"
          role="checkbox"
          aria-checked={checked}
          aria-label={`Mark task ${n} ${checked ? 'not done' : 'done'}`}
          onClick={() => toggle(n)}
        >
          {checked ? <Check size={13} strokeWidth={3} /> : n}
        </button>
        <p className="lab-task-title">{title}</p>
      </div>
      <div className="lab-task-body">{children}</div>
    </li>
  );
}
