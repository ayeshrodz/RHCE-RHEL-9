import { useState } from 'react';
import { Arrow, Diagram, Group, InfoPanel, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('ArchitectureMap', (copy) => {
  const info = copy.data.info;

  function ArchitectureMap() {
    const [sel, setSel] = useState(null);
    const pick = (k) => () => setSel((s) => (s === k ? null : k));
    const n = (k) => ({ active: sel === k, dim: sel && sel !== k, onClick: pick(k) });

    return (
      <Diagram height={372} title={copy.text.title} caption={copy.text.caption} below={<InfoPanel item={info[sel]} />}>
        <Group x={10} y={10} w={400} h={352} tone="gray" label={copy.text.label} sub={copy.text.sub} />
        <Node x={28} y={46} w={176} h={58} tone="amber" title={copy.text.title2} sub={copy.text.sub2} {...n('inventory')} />
        <Node x={216} y={46} w={176} h={58} tone="gray" title={copy.text.title3} sub={copy.text.sub3} {...n('config')} />

        <Group x={28} y={120} w={364} h={160} tone="purple" label={copy.text.label2} sub={copy.text.sub4} />
        <Node x={44} y={154} w={332} h={52} tone="purple" title={copy.text.title4} sub={copy.text.sub5} {...n('play1')} />
        <Node x={44} y={214} w={332} h={52} tone="purple" title={copy.text.title5} sub={copy.text.sub6} {...n('play2')} />

        <Node x={28} y={294} w={364} h={54} tone="teal" title={copy.text.title6} sub={copy.text.sub7} {...n('modules')} />

        <Group x={450} y={10} w={220} h={352} tone="green" label={copy.text.label3} sub={copy.text.sub8} />
        <Node x={466} y={46} w={188} h={58} tone="green" title={copy.text.title7} sub={copy.text.sub9} {...n('linux')} />
        <Node x={466} y={122} w={188} h={58} tone="green" title={copy.text.title8} sub={copy.text.sub10} {...n('linux')} />
        <Node x={466} y={198} w={188} h={58} tone="blue" title={copy.text.title9} sub={copy.text.sub11} {...n('windows')} />
        <Node x={466} y={274} w={188} h={58} tone="gray" title={copy.text.title10} sub={copy.text.sub12} {...n('network')} />

        {[
          [75, 'SSH'],
          [151, 'SSH'],
          [227, 'WinRM'],
          [303, copy.text.label4],
        ].map(([y, label]) => (
          <Arrow
            key={y}
            points={[
              [412, y],
              [464, y],
            ]}
            label={label}
            hot={sel === 'modules'}
          />
        ))}
      </Diagram>
    );
  }
  return ArchitectureMap;
});
