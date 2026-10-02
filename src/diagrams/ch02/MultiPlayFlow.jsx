import { Arrow, Badge, Diagram, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('MultiPlayFlow', (copy) => {
  function MultiPlayFlow() {
    return (
      <Diagram height={236} title={copy.text.title} caption={copy.text.caption}>
        <Node x={10} y={88} w={130} h={60} tone="purple" title={copy.text.title2} sub={copy.text.sub} mono />
        <Arrow
          points={[
            [140, 118],
            [168, 118],
            [168, 58],
            [198, 58],
          ]}
        />
        <Arrow
          points={[
            [140, 118],
            [168, 118],
            [168, 178],
            [198, 178],
          ]}
        />

        <Node x={200} y={20} w={250} h={76} tone="blue" title={copy.text.title3} sub={[copy.text.sub2, copy.text.sub3]} />
        <Badge x={200} y={20} n={1} />
        <Arrow
          points={[
            [450, 58],
            [518, 58],
          ]}
          label={copy.text.label}
        />
        <Node x={520} y={28} w={150} h={60} tone="green" title={copy.text.title4} sub={copy.text.sub4} />

        <Node x={200} y={140} w={250} h={76} tone="teal" title={copy.text.title5} sub={[copy.text.sub5, copy.text.sub6]} />
        <Badge x={200} y={140} n={2} />
        <Arrow
          points={[
            [450, 178],
            [518, 178],
          ]}
          label={copy.text.label2}
        />
        <Node x={520} y={148} w={150} h={60} tone="gray" title={copy.text.title6} sub={copy.text.sub7} />
        <Arrow
          points={[
            [595, 148],
            [595, 90],
          ]}
          dashed
          label={copy.text.label3}
          labelAnchor="end"
          labelDx={-8}
          labelDy={4}
        />
      </Diagram>
    );
  }
  return MultiPlayFlow;
});
