import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const MODULES = [
  { fqcn: 'ansible.builtin.copy', cat: 'Files', text: 'Copy a local file (or inline content) to the managed host.' },
  {
    fqcn: 'ansible.builtin.file',
    cat: 'Files',
    text: 'Set permissions, ownership and other properties of files; create directories and links.',
  },
  { fqcn: 'ansible.builtin.lineinfile', cat: 'Files', text: 'Make sure a particular line is, or is not, in a file.' },
  { fqcn: 'ansible.posix.synchronize', cat: 'Files', text: 'Synchronise content using rsync.' },
  { fqcn: 'ansible.builtin.package', cat: 'Software', text: 'Manage packages with whichever package manager the OS uses.' },
  { fqcn: 'ansible.builtin.dnf', cat: 'Software', text: 'Manage packages with DNF.' },
  { fqcn: 'ansible.builtin.apt', cat: 'Software', text: 'Manage packages with APT.' },
  { fqcn: 'ansible.builtin.pip', cat: 'Software', text: 'Manage Python packages from PyPI.' },
  { fqcn: 'ansible.posix.firewalld', cat: 'System', text: 'Manage arbitrary ports and services with firewalld.' },
  { fqcn: 'ansible.builtin.reboot', cat: 'System', text: 'Reboot a machine and wait for it to come back.' },
  { fqcn: 'ansible.builtin.service', cat: 'System', text: 'Manage services: start, stop, restart, enable at boot.' },
  { fqcn: 'ansible.builtin.user', cat: 'System', text: 'Add, remove and manage user accounts.' },
  { fqcn: 'ansible.builtin.get_url', cat: 'Net tools', text: 'Download files over HTTP, HTTPS or FTP.' },
  { fqcn: 'ansible.builtin.uri', cat: 'Net tools', text: 'Interact with web services; check status codes and content.' },
  {
    fqcn: 'ansible.builtin.command',
    cat: 'Commands',
    text: 'Run a command without a shell. Not idempotent unless you add creates/removes.',
    warn: true,
  },
  {
    fqcn: 'ansible.builtin.shell',
    cat: 'Commands',
    text: 'Run a command through a shell (pipes, redirects, variables). Not idempotent.',
    warn: true,
  },
  {
    fqcn: 'ansible.builtin.raw',
    cat: 'Commands',
    text: 'Run a command over SSH without the module system. Works without Python; useful to bootstrap it.',
    warn: true,
  },
];
const CATS = ['All', 'Files', 'Software', 'System', 'Net tools', 'Commands'];

/** Filterable reference of common modules, with the doc command for each. */
export default function ModuleExplorer() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('ansible.builtin.dnf');
  const [copied, setCopied] = useState(false);
  const list = MODULES.filter((m) => (cat === 'All' || m.cat === cat) && (m.fqcn + m.text).toLowerCase().includes(q.toLowerCase()));
  const cmd = `ansible-navigator doc ${sel} -m stdout`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="widget mods">
      <div className="mods-head">
        <div className="segmented" role="tablist">
          {CATS.map((c) => (
            <button key={c} role="tab" aria-selected={c === cat} className={c === cat ? 'is-active' : ''} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <input className="mods-search" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter modules" />
      </div>
      <div className="mods-list">
        {list.map((m) => (
          <button key={m.fqcn} className={`mods-item ${sel === m.fqcn ? 'is-active' : ''}`} onClick={() => setSel(m.fqcn)}>
            <code>{m.fqcn}</code>
            <span>{m.text}</span>
            {m.warn && <span className="mods-warn">not idempotent</span>}
          </button>
        ))}
        {list.length === 0 && <p className="term-muted">No modules match.</p>}
      </div>
      <div className="mods-cmd">
        <code>{cmd}</code>
        <button className="code-copy" onClick={copy} aria-label="Copy command">
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}
