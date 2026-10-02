import { useState } from 'react';
import { Lock, LockOpen, ArrowRight } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('VaultCommands', (copy) => {
  const COMMANDS = copy.data.commands;

  const State = ({ state }) =>
    state === null ? (
      <span className="vc-state is-none">{copy.text.vcState}</span>
    ) : state === 'locked' ? (
      <span className="vc-state is-locked">
        <Lock size={13} />
        {copy.text.vcState2}
      </span>
    ) : (
      <span className="vc-state is-open">
        <LockOpen size={13} />
        {copy.text.vcState3}
      </span>
    );

  function VaultCommands() {
    const [sel, setSel] = useState(0);
    const c = COMMANDS[sel];
    return (
      <div className="widget vc">
        <div className="segmented" role="tablist" aria-label={copy.text.label}>
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
            <span className="term-muted">{copy.text.termMuted}</span>
            {c.run}
            {c.prompts.map((p) => formatCopy(copy.text.template, [p]))}
          </pre>
          <p className="vc-text">{c.text}</p>
        </div>
      </div>
    );
  }
  return VaultCommands;
});
