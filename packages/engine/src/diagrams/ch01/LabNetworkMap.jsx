import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Arrow, Diagram, Group, Node } from '../kit';
import { usePlaceholderValues } from '@/lib/placeholders';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('LabNetworkMap', (copy) => {
  const FLOWS = copy.data.flows;

  const N = copy.data.n;

  function LabNetworkMap() {
    const [sel, setSel] = useState(copy.data.initialSelection1);
    const flow = FLOWS.find((f) => f.id === sel);
    const [values] = usePlaceholderValues();
    // Show the reader's own addresses in the diagram once they have filled them in.
    const fill = (text) => (typeof text === 'string' ? text.replace(/<(\w+)>/g, (m, k) => values[k]?.trim() || m) : text);

    const panel = (
      <div className="lnm-panel">
        <div className="lnm-flows" role="radiogroup" aria-label={copy.text.label}>
          {[true, false].map((ok) => (
            <div key={String(ok)} className="lnm-flow-group">
              <span className={`lnm-flow-head ${ok ? 'is-ok' : 'is-bad'}`}>{ok ? 'Allowed' : 'Blocked'}</span>
              {FLOWS.filter((f) => f.ok === ok).map((f) => (
                <button
                  key={f.id}
                  role="radio"
                  aria-checked={f.id === sel}
                  className={`chip ${f.id === sel ? 'is-active' : ''} ${ok ? 't-green' : 't-red'}`}
                  onClick={() => setSel(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className={`lnm-verdict ${flow.ok ? 'is-ok' : 'is-bad'}`} aria-live="polite">
          <p className="lnm-verdict-title">
            {flow.ok ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />} {flow.label}
            {copy.text.lnmVerdictTitle}
            {flow.ok ? 'allowed' : 'blocked'}
          </p>
          <p className="lnm-verdict-text">{flow.text}</p>
          <code className="lnm-rule">{flow.rule}</code>
        </div>
      </div>
    );

    return (
      <Diagram height={400} title={copy.text.title} caption={copy.text.caption} below={panel}>
        <Group x={8} y={86} w={162} h={166} tone="gray" label={copy.text.label2} />
        <Group x={196} y={86} w={228} h={308} tone="purple" label={copy.text.label3} />
        <Group x={452} y={86} w={220} h={236} tone="green" label={copy.text.label4} sub={copy.text.sub} active />

        {/* Static wiring */}
        <Arrow
          points={[
            [140, 58],
            [140, 112],
          ]}
          both
          dim={!!flow}
        />
        <Arrow
          points={[
            [158, 138],
            [208, 138],
          ]}
          both
          dim={!!flow}
        />
        <Arrow
          points={[
            [310, 168],
            [310, 186],
          ]}
          both
          dim={!!flow}
        />
        <Arrow
          points={[
            [310, 240],
            [310, 256],
          ]}
          both
          dim={!!flow}
        />
        <Arrow
          points={[
            [410, 314],
            [440, 314],
            [450, 314],
          ]}
          both
          dim={!!flow}
        />

        {Object.entries(N).map(([k, n]) => (
          <Node key={k} {...n} sub={fill(n.sub)} dim={!flow.nodes.includes(k) && k !== 'ut'} active={flow.nodes.includes(k)} />
        ))}

        {flow.arrows.map((a, i) => (
          <Arrow key={`${sel}-${i}`} {...a} />
        ))}
      </Diagram>
    );
  }
  return LabNetworkMap;
});
