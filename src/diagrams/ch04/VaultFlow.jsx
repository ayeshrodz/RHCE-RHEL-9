import { Arrow, Badge, Diagram, Group, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('VaultFlow', (copy) => {
  function VaultFlow() {
    return (
      <Diagram height={300} title={copy.text.title} caption={copy.text.caption}>
        <Node x={10} y={40} w={150} h={96} tone="coral" title={copy.text.title2} sub={[copy.text.sub, copy.text.sub2]} />
        <Badge x={10} y={40} n={1} />
        <Arrow
          points={[
            [160, 88],
            [236, 88],
          ]}
          label={copy.text.label}
          hot
        />

        <Node
          x={238}
          y={40}
          w={196}
          h={96}
          tone="gray"
          title={copy.text.title3}
          sub={[copy.text.sub3, copy.text.sub4, copy.text.sub5]}
          mono
          titleSize={13}
        />
        <Badge x={238} y={40} n={2} />

        <Node x={494} y={24} w={176} h={52} tone="purple" title={copy.text.title4} sub={copy.text.sub6} />
        <Arrow
          points={[
            [582, 76],
            [582, 176],
          ]}
          dashed
          label={copy.text.label2}
          labelAnchor="start"
          labelDx={8}
          labelDy={4}
        />

        <Arrow
          points={[
            [336, 136],
            [336, 206],
            [490, 206],
          ]}
          label={copy.text.label3}
          labelAt={0.75}
        />

        <Group x={492} y={176} w={180} h={116} tone="teal" label={copy.text.label4} solid />
        <Badge x={492} y={176} n={3} />
        <Node x={506} y={210} w={152} h={66} tone="teal" title={copy.text.title5} sub={copy.text.sub7} titleSize={13} />

        <Label x={130} y={200} anchor="middle" muted size={12}>
          {copy.text.label5}
        </Label>
        <Label x={130} y={218} anchor="middle" muted size={12}>
          {copy.text.label6}
        </Label>
      </Diagram>
    );
  }
  return VaultFlow;
});
