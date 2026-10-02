import { Diagram, Group, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('PlaybookNesting', (copy) => {
  function PlaybookNesting() {
    return (
      <Diagram height={262} title={copy.text.title} caption={copy.text.caption}>
        <Group x={8} y={8} w={664} h={246} tone="purple" label={copy.text.label} solid />

        <Group x={24} y={42} w={306} h={200} tone="blue" label={copy.text.label2} sub={copy.text.sub} />
        <Node x={40} y={76} w={274} h={48} tone="teal" title={copy.text.title2} sub={copy.text.sub2} align="start" />
        <Node x={40} y={130} w={274} h={48} tone="teal" title={copy.text.title3} sub={copy.text.sub3} align="start" />
        <Node x={40} y={184} w={274} h={48} tone="teal" title={copy.text.title4} sub={copy.text.sub4} align="start" />

        <Group x={350} y={42} w={306} h={200} tone="amber" label={copy.text.label3} sub={copy.text.sub5} />
        <Node x={366} y={76} w={274} h={48} tone="teal" title={copy.text.title5} sub={copy.text.sub6} align="start" />
        <Node x={366} y={130} w={274} h={48} tone="teal" title={copy.text.title6} sub={copy.text.sub7} align="start" />
      </Diagram>
    );
  }
  return PlaybookNesting;
});
