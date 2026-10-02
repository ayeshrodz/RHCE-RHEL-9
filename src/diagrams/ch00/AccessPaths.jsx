import { Arrow, Diagram, Group, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('AccessPaths', (copy) => {
  function AccessPaths() {
    return (
      <Diagram height={170} title={copy.text.title} caption={copy.text.caption}>
        <Node x={8} y={50} w={130} h={60} tone="gray" title={copy.text.title2} sub={copy.text.sub} />
        <Arrow
          points={[
            [138, 80],
            [182, 80],
          ]}
          label={copy.text.label}
        />
        <Node x={184} y={50} w={130} h={60} tone="purple" title={copy.text.title3} sub={copy.text.sub2} />
        <Arrow
          points={[
            [314, 80],
            [362, 80],
          ]}
          label={copy.text.label2}
        />
        <Group x={364} y={10} w={308} h={150} tone="green" label={copy.text.label3} />
        <Node x={380} y={50} w={120} h={60} tone="green" title={copy.text.title4} sub={copy.text.sub3} />
        <Arrow
          points={[
            [500, 80],
            [540, 80],
          ]}
          label={copy.text.label4}
        />
        <Node x={542} y={36} w={116} h={40} tone="green" title={copy.text.title5} titleSize={12.5} />
        <Node x={542} y={84} w={116} h={40} tone="green" title={copy.text.title6} titleSize={12.5} />
        <Arrow
          points={[
            [8, 140],
            [8, 150],
            [440, 150],
            [440, 112],
          ]}
          dashed
          label={copy.text.label5}
          labelAt={0.35}
          labelDy={-6}
        />
      </Diagram>
    );
  }
  return AccessPaths;
});
