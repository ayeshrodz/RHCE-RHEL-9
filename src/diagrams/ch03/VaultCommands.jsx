import { useState } from 'react';
import { Lock, LockOpen, ArrowRight } from 'lucide-react';

const COMMANDS = [
  {
    cmd: 'create',
    run: 'ansible-vault create secret.yml',
    before: null,
    after: 'locked',
    prompts: ['New Vault password', 'Confirm New Vault password'],
    text: 'Makes a new encrypted file. It asks for a new password, then opens your editor (vi by default; set EDITOR=nano to change it). When you save and quit, the content is encrypted.',
  },
  {
    cmd: 'view',
    run: 'ansible-vault view secret.yml',
    before: 'locked',
    after: 'locked',
    prompts: ['Vault password'],
    text: 'Prints the decrypted content to the terminal without changing the file. Use it whenever you only need to read.',
  },
  {
    cmd: 'edit',
    run: 'ansible-vault edit secret.yml',
    before: 'locked',
    after: 'locked',
    prompts: ['Vault password'],
    text: 'Decrypts to a temporary file, opens your editor, then re-encrypts and removes the temporary copy. It always rewrites the file, which shows up as a change in Git even if you edited nothing, so prefer view for reading.',
  },
  {
    cmd: 'encrypt',
    run: 'ansible-vault encrypt secret1.yml secret2.yml',
    before: 'open',
    after: 'locked',
    prompts: ['New Vault password', 'Confirm New Vault password'],
    text: 'Encrypts files that already exist, in place. Accepts several files at once. Add --output=NEW_FILE to write the result to a new name (one input file only).',
  },
  {
    cmd: 'decrypt',
    run: 'ansible-vault decrypt secret1.yml --output=secret1-decrypted.yml',
    before: 'locked',
    after: 'open',
    prompts: ['Vault password'],
    text: 'Removes the encryption permanently. With a single file, --output writes the plain text to a different name and leaves the original encrypted.',
  },
  {
    cmd: 'rekey',
    run: 'ansible-vault rekey secret.yml',
    before: 'locked',
    after: 'locked',
    prompts: ['Vault password', 'New Vault password', 'Confirm New Vault password'],
    text: 'Changes the password. It works on several files at once. With password files, use --new-vault-password-file for the new one.',
  },
];

const State = ({ state }) =>
  state === null ? (
    <span className="vc-state is-none">no file</span>
  ) : state === 'locked' ? (
    <span className="vc-state is-locked">
      <Lock size={13} /> encrypted
    </span>
  ) : (
    <span className="vc-state is-open">
      <LockOpen size={13} /> plain text
    </span>
  );

/** Pick an ansible-vault subcommand to see what it does to the file. */
export default function VaultCommands() {
  const [sel, setSel] = useState(0);
  const c = COMMANDS[sel];
  return (
    <div className="widget vc">
      <div className="segmented" role="tablist" aria-label="ansible-vault subcommands">
        {COMMANDS.map((x, i) => (
          <button key={x.cmd} role="tab" aria-selected={i === sel} className={i === sel ? 'is-active' : ''} onClick={() => setSel(i)}>
            {x.cmd}
          </button>
        ))}
      </div>
      <div className="vc-body" aria-live="polite">
        <div className="vc-states">
          <State state={c.before} />
          <ArrowRight size={16} className="vc-arrow" />
          <State state={c.after} />
        </div>
        <pre className="terminal">
          <span className="term-muted">[student@workstation ~]$ </span>
          {c.run}
          {c.prompts.map((p) => `\n${p}: ********`)}
        </pre>
        <p className="vc-text">{c.text}</p>
      </div>
    </div>
  );
}
