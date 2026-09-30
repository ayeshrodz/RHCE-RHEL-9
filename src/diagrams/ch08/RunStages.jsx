import { useState } from 'react';
import { Arrow, Diagram, Node } from '../kit';

const STAGES = [
  {
    id: 'parse',
    title: 'Read the playbook',
    sub: 'YAML and task syntax',
    tone: 'purple',
    signs: 'ERROR! before any PLAY line: a YAML problem, a misindented argument, a misspelt module name.',
    tools: ['ansible-navigator run --syntax-check', 'read the line and column in the message, and the line above it'],
  },
  {
    id: 'hosts',
    title: 'Pick the hosts',
    sub: 'inventory and patterns',
    tone: 'amber',
    signs: 'A warning that a pattern matched nothing, “skipping: no hosts matched”, or a play that runs on fewer hosts than you expected.',
    tools: ['--list-hosts', 'ansible-navigator inventory -m stdout --graph', 'ansible-navigator inventory -m stdout --host NAME'],
  },
  {
    id: 'connect',
    title: 'Connect',
    sub: 'SSH as remote_user',
    tone: 'blue',
    signs: 'UNREACHABLE! with an SSH message: the name does not resolve, no route to the address, or permission denied for the user.',
    tools: ['ansible HOST -m ansible.builtin.ping', 'ssh USER@HOST by hand', '-vvv shows the exact ssh command'],
  },
  {
    id: 'escalate',
    title: 'Become root',
    sub: 'sudo',
    tone: 'teal',
    signs: 'FAILED (not unreachable) with “Missing sudo password”, “Permission denied” or “Destination … not writable”.',
    tools: ['check become in ansible.cfg and the play', 'ansible HOST -m ansible.builtin.command -a id --become'],
  },
  {
    id: 'module',
    title: 'Run the task',
    sub: 'module and arguments',
    tone: 'green',
    signs: 'FAILED with a message about an argument, an undefined variable, a template error, or a missing library on the host.',
    tools: ['ansible-navigator doc MODULE -m stdout', 'debug the variables involved', '--start-at-task after a fix'],
  },
  {
    id: 'result',
    title: 'Check the result',
    sub: 'does it really work?',
    tone: 'red',
    signs: 'Everything is ok or changed, yet the service is not what you wanted. Ansible did exactly what the playbook says.',
    tools: ['a test play with uri, stat or assert', 'curl, ssh and the service’s own logs', '--check --diff before the next change'],
  },
];

/** The stages every task passes through, with the symptoms and tools for each. */
export default function RunStages() {
  const [sel, setSel] = useState('parse');
  const s = STAGES.find((x) => x.id === sel);
  const W = 190;
  const X = [10, 245, 480];
  const pos = (i) => ({ x: X[i % 3], y: i < 3 ? 12 : 104 });
  return (
    <Diagram
      height={172}
      title="Where a run can go wrong"
      expandable={false}
      below={
        <div className={`dg-info t-${s.tone}`} aria-live="polite">
          <p className="dg-info-title">{s.title}</p>
          <p className="dg-info-text">
            <strong>Signs: </strong>
            {s.signs}
          </p>
          <ul className="rs-tools">
            {s.tools.map((t) => (
              <li key={t}>
                <code>{t}</code>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      {STAGES.map((x, i) => (
        <Node
          key={x.id}
          {...pos(i)}
          w={W}
          h={56}
          tone={x.tone}
          title={`${i + 1} · ${x.title}`}
          sub={x.sub}
          active={sel === x.id}
          dim={sel !== x.id}
          onClick={() => setSel(x.id)}
        />
      ))}
      {[0, 1, 3, 4].map((i) => (
        <Arrow
          key={i}
          points={[
            [pos(i).x + W, pos(i).y + 28],
            [pos(i + 1).x - 2, pos(i + 1).y + 28],
          ]}
        />
      ))}
      <Arrow
        points={[
          [X[2] + W / 2, 68],
          [X[2] + W / 2, 86],
          [X[0] + W / 2, 86],
          [X[0] + W / 2, 102],
        ]}
      />
    </Diagram>
  );
}
