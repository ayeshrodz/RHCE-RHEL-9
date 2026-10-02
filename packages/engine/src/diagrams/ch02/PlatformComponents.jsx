import { useState } from 'react';
import { Arrow, Diagram, Group, InfoPanel, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('PlatformComponents', (copy) => {
  const info = copy.data.info;

  function PlatformComponents() {
    const [sel, setSel] = useState(null);
    const n = (k) => ({
      active: sel === k,
      dim: sel && sel !== k && !(sel === 'ee' && (k === 'core' || k === 'collections')),
      onClick: () => setSel((s) => (s === k ? null : k)),
    });

    return (
      <Diagram height={340} title={copy.text.title} caption={copy.text.caption} below={<InfoPanel item={info[sel]} />}>
        <Node x={250} y={10} w={180} h={56} tone="blue" title={copy.text.title2} sub={copy.text.sub} {...n('hub')} />
        <Arrow
          points={[
            [340, 66],
            [340, 106],
          ]}
          label={copy.text.label}
          labelAnchor="start"
          labelDx={8}
          labelDy={4}
        />

        <g onClick={() => setSel((s) => (s === 'ee' ? null : 'ee'))} style={{ cursor: 'pointer' }}>
          <Group
            x={220}
            y={108}
            w={240}
            h={152}
            tone="teal"
            label={copy.text.label2}
            sub={copy.text.sub2}
            solid
            active={sel === 'ee'}
            dim={sel && !['ee', 'core', 'collections'].includes(sel)}
          />
        </g>
        <Node x={238} y={146} w={204} h={46} tone="teal" title={copy.text.title3} {...n('core')} />
        <Node x={238} y={200} w={204} h={46} tone="purple" title={copy.text.title4} {...n('collections')} />

        <Node x={10} y={154} w={170} h={62} tone="amber" title={copy.text.title5} sub={copy.text.sub3} {...n('navigator')} />
        <Arrow
          points={[
            [180, 185],
            [218, 185],
          ]}
        />
        <Node x={500} y={154} w={170} h={62} tone="coral" title={copy.text.title6} sub={copy.text.sub4} {...n('controller')} />
        <Arrow
          points={[
            [500, 185],
            [462, 185],
          ]}
        />

        <Node x={250} y={282} w={180} h={50} tone="gray" title={copy.text.title7} sub={copy.text.sub5} {...n('builder')} />
        <Arrow
          points={[
            [340, 282],
            [340, 262],
          ]}
        />
      </Diagram>
    );
  }
  return PlatformComponents;
});
