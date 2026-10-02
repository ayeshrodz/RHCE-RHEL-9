import { useState } from 'react';
import { Arrow, Diagram, Node } from '../kit';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('RunStages', (copy) => {
  const STAGES = copy.data.stages;

  function RunStages() {
    const [sel, setSel] = useState(copy.data.initialSelection1);
    const s = STAGES.find((x) => x.id === sel);
    const W = 190;
    const X = [10, 245, 480];
    const pos = (i) => ({ x: X[i % 3], y: i < 3 ? 12 : 104 });
    return (
      <Diagram
        height={172}
        title={copy.text.title}
        expandable={false}
        below={
          <div className={`dg-info t-${s.tone}`} aria-live="polite">
            <p className="dg-info-title">{s.title}</p>
            <p className="dg-info-text">
              <strong>{copy.text.strong}</strong>
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
            title={formatCopy(copy.text.template, [i + 1, x.title])}
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
  return RunStages;
});
