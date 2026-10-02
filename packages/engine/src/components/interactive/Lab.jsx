import { Children, cloneElement, createContext, isValidElement, useContext } from 'react';
import { Check, FlaskConical, PartyPopper, Server } from 'lucide-react';
import { useStored } from '@/lib/storage';
import { usePageKey } from '@/lib/pageContext';
import { exerciseName } from '@/lib/labEnv';
import { HomeSetup, LabPrep } from './Env';
import OptionSwitch from './OptionSwitch';

const LabContext = createContext(null);
const EMPTY = [];

/**
 * Hands-on exercise with persisted task checkboxes.
 * <Lab id="inventory" outcomes={[...]} classroom="lab start playbook-inventory" hosts={[...]}>
 *   <HomeSetup>optional extra notes for the home lab</HomeSetup>
 *   <LabNotes>Authored prerequisites, verification, and variation</LabNotes>
 *   <LabChallenge>Authored purpose and independent requirements</LabChallenge>
 *   <Task id="stable-task-id" title="...">...</Task>
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
  const [preferredMode, setMode] = useStored('labMode', 'guided');
  const parts = Children.toArray(children);
  const challenge = parts.find((child) => isValidElement(child) && child.type === LabChallenge);
  const notes = parts.find((child) => isValidElement(child) && child.type === LabNotes);
  const mode = challenge ? preferredMode : 'guided';
  const [done, setDone] = useStored(`lab:${pageKey}:${id}`, EMPTY);

  let n = 0;
  const homeSetup = [];
  const numbered = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === HomeSetup) {
      homeSetup.push(child.props.children);
      return null;
    }
    if (isValidElement(child) && [LabChallenge, LabNotes].includes(child.type)) return null;
    return isValidElement(child) && child.type === Task ? cloneElement(child, { n: ++n }) : child;
  });
  const total = n;
  const ids = Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === Task)
    .map((child) => child.props.id);
  const count = done.filter((id) => ids.includes(id)).length;
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

          {challenge && (
            <OptionSwitch
              className="lab-mode"
              label="Practice mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'guided', label: 'Guided' },
                { value: 'challenge', label: 'Challenge' },
              ]}
            />
          )}
          {mode === 'challenge' && (
            <p>Solve the requirements below before opening the walkthrough. Documentation and help are available whenever you need them.</p>
          )}
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

        {notes}
        {mode === 'challenge' ? (
          <>
            {challenge}
            <details className="lab-walkthrough" key="challenge-help">
              <summary>Open guided walkthrough and task checklist</summary>
              <ol className="lab-tasks">{numbered}</ol>
            </details>
          </>
        ) : (
          <ol className="lab-tasks">{numbered}</ol>
        )}

        {total > 0 && count === total && (
          <footer className="lab-done">
            <PartyPopper size={16} /> Checklist complete. Verify the host state, then repeat independently to practise recall.
          </footer>
        )}
      </section>
    </LabContext.Provider>
  );
}

export function Task({ id, n, title, children }) {
  const { done, toggle } = useContext(LabContext);
  const checked = done.includes(id);
  return (
    <li id={id} className={`lab-task ${checked ? 'is-done' : ''}`}>
      <div className="lab-task-head">
        <button
          className="lab-check"
          role="checkbox"
          aria-checked={checked}
          aria-label={`Mark task ${n} ${checked ? 'not done' : 'done'}`}
          onClick={() => toggle(id)}
        >
          {checked ? <Check size={13} strokeWidth={3} /> : n}
        </button>
        <p className="lab-task-title">{title}</p>
      </div>
      <div className="lab-task-body">{children}</div>
    </li>
  );
}

// Instructional content belongs to the content page; these are presentation markers.
export function LabChallenge({ children }) {
  return (
    <div className="lab-challenge">
      <p className="lab-meta-label">Your challenge</p>
      {children}
    </div>
  );
}
export function LabNotes({ children }) {
  return <div className="lab-notes">{children}</div>;
}
