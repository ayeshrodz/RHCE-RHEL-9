import { Arrow, Diagram, Group, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('NavigatorRuntime', (copy) => {
  function NavigatorRuntime() {
    return (
      <Diagram height={300} title={copy.text.title} caption={copy.text.caption}>
        <Node x={372} y={8} w={160} h={52} tone="blue" title={copy.text.title2} sub={copy.text.sub} />
        <Arrow
          points={[
            [452, 60],
            [452, 120],
          ]}
          label={copy.text.label}
          labelAnchor="end"
          labelDx={-8}
          labelDy={-4}
        />

        <Group x={10} y={84} w={540} h={206} tone="gray" label={copy.text.label2} />
        <Node x={30} y={122} w={170} h={62} tone="amber" title={copy.text.title3} sub={copy.text.sub2} />
        <Node x={30} y={204} w={170} h={62} tone="purple" title={copy.text.title4} sub={copy.text.sub3} />
        <Arrow
          points={[
            [200, 153],
            [370, 153],
          ]}
          label={copy.text.label3}
        />
        <Arrow
          points={[
            [200, 235],
            [370, 235],
          ]}
          label={copy.text.label4}
        />
        <Node
          x={372}
          y={122}
          w={160}
          h={144}
          tone="teal"
          title={copy.text.title5}
          sub={[copy.text.sub4, copy.text.sub5, copy.text.sub6, copy.text.sub7]}
        />

        <Group x={566} y={84} w={104} h={206} tone="green" label={copy.text.label5} />
        <Node x={578} y={122} w={80} h={56} tone="green" title={copy.text.title6} />
        <Node x={578} y={206} w={80} h={56} tone="green" title={copy.text.title7} />
        <Arrow
          points={[
            [532, 150],
            [576, 150],
          ]}
          label={copy.text.label6}
        />
        <Arrow
          points={[
            [532, 234],
            [576, 234],
          ]}
          label={copy.text.label7}
        />
      </Diagram>
    );
  }
  return NavigatorRuntime;
});
