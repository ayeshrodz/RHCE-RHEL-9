import { Arrow, Diagram, Group, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('RegisterFlow', (copy) => {
  function RegisterFlow() {
    return (
      <Diagram height={250} title={copy.text.title} caption={copy.text.caption}>
        <Group x={8} y={8} w={220} h={234} tone="purple" label={copy.text.label} />
        <Node x={24} y={44} w={188} h={52} tone="teal" title={copy.text.title2} sub={copy.text.sub} mono />
        <Node x={24} y={170} w={188} h={52} tone="purple" title={copy.text.title3} mono titleSize={12.5} />
        <Arrow
          points={[
            [118, 96],
            [118, 168],
          ]}
          label={copy.text.label2}
          labelAnchor="start"
          labelDx={8}
          labelDy={4}
        />

        <Node
          x={262}
          y={62}
          w={200}
          h={140}
          tone="gray"
          title={copy.text.title4}
          sub={[copy.text.sub2, copy.text.sub3, copy.text.sub4, copy.text.sub5]}
          mono
        />
        <Arrow
          points={[
            [212, 196],
            [240, 196],
            [240, 132],
            [260, 132],
          ]}
        />

        <Group x={494} y={8} w={178} h={234} tone="amber" label={copy.text.label3} />
        <Node x={508} y={44} w={150} h={52} tone="amber" title={copy.text.title5} sub={copy.text.sub6} />
        <Node x={508} y={106} w={150} h={52} tone="amber" title={copy.text.title6} sub={copy.text.sub7} />
        <Node x={508} y={168} w={150} h={52} tone="amber" title={copy.text.title7} sub={copy.text.sub8} />
        {[70, 132, 194].map((y) => (
          <Arrow
            key={y}
            points={[
              [462, 132],
              [484, 132],
              [484, y],
              [506, y],
            ]}
          />
        ))}
        <Label x={585} y={236} muted size={11}>
          {copy.text.label4}
        </Label>
      </Diagram>
    );
  }
  return RegisterFlow;
});
