import { useState } from 'react';
import { Arrow, Diagram, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('ProjectMap', (copy) => {
  const files = copy.data.files;

  function ProjectMap() {
    const [sel, setSel] = useState(copy.data.initialSelection1);
    const n = (k) => ({ active: sel === k, dim: sel !== k, onClick: () => setSel(k), mono: true, tone: files[k].tone });
    const f = files[sel];

    return (
      <Diagram
        height={230}
        title={copy.text.title}
        expandable={false}
        below={
          <div className={`dg-info t-${f.tone}`} aria-live="polite">
            <p className="dg-info-title">{f.name}</p>
            <p className="dg-info-text">{f.text}</p>
            <pre className="terminal pm-code">{f.code}</pre>
          </div>
        }
      >
        <Node x={20} y={90} w={130} h={50} title={copy.text.title2} sub={copy.text.sub} {...n('site')} />
        <Node x={260} y={30} w={150} h={50} title={copy.text.title3} sub={copy.text.sub2} {...n('web')} />
        <Node x={260} y={150} w={150} h={50} title={copy.text.title4} sub={copy.text.sub3} {...n('db')} />
        <Node x={500} y={90} w={165} h={50} title={copy.text.title5} sub={copy.text.sub4} {...n('install')} />
        <Node x={500} y={10} w={165} h={50} title={copy.text.title6} sub={copy.text.sub5} {...n('firewall')} />

        <Arrow
          points={[
            [150, 105],
            [200, 105],
            [200, 55],
            [258, 55],
          ]}
          label={copy.text.label}
          labelAt={0.2}
          labelDy={-46}
          hot={sel === 'site'}
        />
        <Arrow
          points={[
            [150, 125],
            [200, 125],
            [200, 175],
            [258, 175],
          ]}
          hot={sel === 'site'}
        />
        <Arrow
          points={[
            [410, 45],
            [498, 35],
          ]}
          label={copy.text.label2}
          labelDy={-9}
          hot={sel === 'web'}
          dashed
        />
        <Arrow
          points={[
            [410, 65],
            [455, 65],
            [455, 105],
            [498, 105],
          ]}
          hot={sel === 'web'}
        />
        <Arrow
          points={[
            [410, 175],
            [455, 175],
            [455, 125],
            [498, 125],
          ]}
          label={copy.text.label3}
          labelAt={0.2}
          labelDy={16}
          hot={sel === 'db'}
        />
        <Label x={342} y={222} muted size={11.5}>
          {copy.text.label4}
        </Label>
      </Diagram>
    );
  }
  return ProjectMap;
});
