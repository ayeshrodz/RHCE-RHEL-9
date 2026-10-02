import { Arrow, Diagram, Group, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('ManualVsCode', (copy) => {
  function ManualVsCode() {
    const manual = [70, 170, 270];
    const code = [410, 510, 610];
    return (
      <Diagram height={300} title={copy.text.title} caption={copy.text.caption}>
        <Group x={10} y={10} w={320} h={280} tone="coral" label={copy.text.label} />
        <Node x={100} y={48} w={140} h={54} tone="gray" title={copy.text.title2} sub={copy.text.sub} />
        {manual.map((cx) => (
          <Arrow
            key={cx}
            points={[
              [170, 102],
              [170, 140],
              [cx, 140],
              [cx, 186],
            ]}
          />
        ))}
        <Label x={178} y={124} muted anchor="start">
          {copy.text.label2}
        </Label>
        <Node x={25} y={188} w={90} h={56} tone="gray" title={copy.text.title3} sub={copy.text.sub2} />
        <Node x={125} y={188} w={90} h={56} tone="red" title={copy.text.title4} sub={copy.text.sub3} />
        <Node x={225} y={188} w={90} h={56} tone="gray" title={copy.text.title5} sub={copy.text.sub4} />
        <Label x={170} y={272} muted>
          {copy.text.label3}
        </Label>

        <Group x={350} y={10} w={320} h={280} tone="teal" label={copy.text.label4} />
        <Node x={366} y={48} w={130} h={54} tone="purple" title={copy.text.title6} sub={copy.text.sub5} />
        <Node x={524} y={48} w={130} h={54} tone="teal" title={copy.text.title7} sub={copy.text.sub6} />
        <Arrow
          points={[
            [496, 75],
            [522, 75],
          ]}
        />
        {code.map((cx) => (
          <Arrow
            key={cx}
            points={[
              [589, 102],
              [589, 140],
              [cx, 140],
              [cx, 186],
            ]}
          />
        ))}
        <Node x={365} y={188} w={90} h={56} tone="green" title={copy.text.title8} sub={copy.text.sub7} />
        <Node x={465} y={188} w={90} h={56} tone="green" title={copy.text.title9} sub={copy.text.sub8} />
        <Node x={565} y={188} w={90} h={56} tone="green" title={copy.text.title10} sub={copy.text.sub9} />
        <Label x={510} y={272} muted>
          {copy.text.label5}
        </Label>
      </Diagram>
    );
  }
  return ManualVsCode;
});
