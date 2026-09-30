import { useState } from 'react';

// Real messages from ansible-core 2.14, shortened only where marked.
const ERRORS = [
  {
    stage: 'Read',
    msg: "ERROR! We were unable to read either as JSON nor YAML … found unacceptable key (unhashable type: 'AnsibleMapping') … name: {{ web_package }}",
    cause: 'A value starts with {{ but is not quoted, so YAML reads it as a dictionary.',
    fix: 'Quote the whole value: name: "{{ web_package }}".',
  },
  {
    stage: 'Read',
    msg: 'ERROR! conflicting action statements: ansible.builtin.service, state',
    cause: 'A module argument is indented at the level of the module name, so Ansible sees two things that look like modules in one task.',
    fix: 'Indent the arguments two spaces further than the module name.',
  },
  {
    stage: 'Read',
    msg: "ERROR! couldn't resolve module/action 'ansible.builtin.servise'. This often indicates a misspelling, missing collection, or incorrect module path.",
    cause: 'The module name is misspelt, or its collection is not installed or not on collections_path.',
    fix: 'Check the spelling against ansible-navigator doc; install the collection if it is missing.',
  },
  {
    stage: 'Hosts',
    msg: '[WARNING]: Could not match supplied host pattern, ignoring: webserver',
    cause: 'The play’s hosts line names a group or host the inventory does not have. Often a plural or a typo.',
    fix: 'Compare with ansible-navigator inventory --graph and correct the pattern.',
  },
  {
    stage: 'Connect',
    msg: 'UNREACHABLE! … ssh: Could not resolve hostname serverz.lab.example.com: Name or service not known',
    cause: 'The name cannot be found in DNS or /etc/hosts.',
    fix: 'Fix the name in the inventory, or give the host an ansible_host address.',
  },
  {
    stage: 'Connect',
    msg: 'UNREACHABLE! … ssh: connect to host 172.25.250.211 port 22: No route to host',
    cause: 'Nothing answers at that address. Here an ansible_host variable pointed at the wrong IP.',
    fix: 'ansible-navigator inventory --host NAME shows the variables in force; correct or remove ansible_host.',
  },
  {
    stage: 'Connect',
    msg: 'UNREACHABLE! … operator1@serverc.lab.example.com: Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password).',
    cause: 'The host answered but refused this user. The user is wrong (remote_user or ansible_user) or has no key there.',
    fix: 'Check which user Ansible used (-vvv shows it), then fix the setting or install the key.',
  },
  {
    stage: 'Escalate',
    msg: 'FAILED! … "msg": "Missing sudo password"',
    cause: 'become is on, but the connecting user needs a password for sudo and none was given.',
    fix: 'Connect as a user with passwordless sudo, or run with --ask-become-pass.',
  },
  {
    stage: 'Escalate',
    msg: 'FAILED! … "msg": "Destination /etc not writable"',
    cause: 'The task writes a root-owned file but runs as the ordinary remote user: become is off.',
    fix: 'Set become: true for the play, or become = true in ansible.cfg.',
  },
  {
    stage: 'Task',
    msg: 'FAILED! => {"msg": "The task includes an option with an undefined variable. The error was: \'web_srv\' is undefined …"}',
    cause: 'A variable is used that is not defined, often a typo of one that is.',
    fix: 'Compare the name with the vars section; debug the variable to see its value.',
  },
  {
    stage: 'Task',
    msg: 'FAILED! => {"changed": false, "msg": "value of state must be one of: reloaded, restarted, started, stopped, got: start"}',
    cause: 'The module received an argument value it does not accept.',
    fix: 'The message lists the accepted values; ansible-navigator doc shows them all.',
  },
  {
    stage: 'Task',
    msg: 'FAILED! => {"msg": "AnsibleError: template error while templating string: unexpected \'}\'. …"}',
    cause: 'The Jinja2 template has a syntax error, here a missing closing brace.',
    fix: 'The message quotes the template text; look for an unbalanced {{ }} or {% %}.',
  },
  {
    stage: 'Task',
    msg: "ERROR! The requested handler 'restart web' was not found in either the main handlers list nor in the listening handlers list",
    cause: 'A notify names a handler that does not exist. Handler names must match exactly.',
    fix: 'Make the notify line and the handler’s name identical.',
  },
  {
    stage: 'Result',
    msg: '"msg": "Status code was -1 and not [200]: Request failed: <urlopen error [Errno 113] No route to host>"',
    cause: 'The web server may be running, but the host’s firewall rejects the connection.',
    fix: 'Open the service with ansible.posix.firewalld, permanent and immediate.',
  },
];

const STAGES = ['All', 'Read', 'Hosts', 'Connect', 'Escalate', 'Task', 'Result'];

/** Pick an error message to see what it means and how to fix it. */
export default function ErrorDecoder() {
  const [stage, setStage] = useState('All');
  const [open, setOpen] = useState(0);
  const list = ERRORS.map((e, i) => ({ ...e, i })).filter((e) => stage === 'All' || e.stage === stage);

  return (
    <div className="widget ed">
      <div className="verb-head">
        <p className="widget-label">Error decoder</p>
        <div className="segmented" role="radiogroup" aria-label="Stage">
          {STAGES.map((s) => (
            <button key={s} role="radio" aria-checked={stage === s} className={stage === s ? 'is-active' : ''} onClick={() => setStage(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <ul className="ed-list">
        {list.map((e) => (
          <li key={e.i} className={open === e.i ? 'is-open' : ''}>
            <button onClick={() => setOpen(open === e.i ? -1 : e.i)} aria-expanded={open === e.i}>
              <span className="ed-stage">{e.stage}</span>
              <code className="ed-msg">{e.msg}</code>
            </button>
            {open === e.i && (
              <div className="ed-body">
                <p>
                  <strong>What it means: </strong>
                  {e.cause}
                </p>
                <p>
                  <strong>Fix: </strong>
                  {e.fix}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
