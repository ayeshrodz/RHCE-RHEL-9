import { Arrow, Diagram, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('PrivilegeEscalation', (copy) => {
  function PrivilegeEscalation() {
    return (
      <Diagram height={212} title={copy.text.title} caption={copy.text.caption}>
        <Node x={16} y={56} w={130} h={64} tone="gray" title={copy.text.title2} sub={copy.text.sub} />
        <Arrow
          points={[
            [146, 88],
            [222, 88],
          ]}
          label={copy.text.label}
        />
        <Node x={224} y={56} w={130} h={64} tone="blue" title={copy.text.title3} sub={copy.text.sub2} />
        <Arrow
          points={[
            [354, 88],
            [424, 88],
          ]}
          label={copy.text.label2}
        />
        <Node x={426} y={56} w={110} h={64} tone="coral" title={copy.text.title4} sub={copy.text.sub3} />
        <Arrow
          points={[
            [536, 88],
            [572, 88],
          ]}
        />
        <Node x={574} y={56} w={92} h={64} tone="teal" title={copy.text.title5} sub={copy.text.sub4} />

        <Label x={81} y={146} mono muted>
          {copy.text.label3}
        </Label>
        <Label x={289} y={146} mono muted>
          {copy.text.label4}
        </Label>
        <Label x={481} y={146} mono muted>
          {copy.text.label5}
        </Label>
        <Label x={340} y={188} mono muted>
          {copy.text.label6}
        </Label>
        <Label x={340} y={30} muted>
          {copy.text.label7}
        </Label>
      </Diagram>
    );
  }
  return PrivilegeEscalation;
});
