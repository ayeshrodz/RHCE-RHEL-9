import { Arrow, Diagram, Group, Label, Node } from '../kit';
import { usePlaceholderValues } from '@/lib/placeholders';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('TwoAddresses', (copy) => {
  function TwoAddresses() {
    const [values] = usePlaceholderValues();
    const lan = values.HOST_LAN_IP?.trim() || '<HOST_LAN_IP>';
    return (
      <Diagram height={250} title={copy.text.title} caption={copy.text.caption}>
        <Node x={10} y={20} w={140} h={46} tone="blue" title={copy.text.title2} />
        <Node x={10} y={100} w={140} h={52} tone="gray" title={copy.text.title3} sub={copy.text.sub} />
        <Arrow
          points={[
            [80, 66],
            [80, 98],
          ]}
          both
        />

        <Group x={188} y={10} w={304} h={230} tone="purple" label={copy.text.label} />
        <Node x={204} y={96} w={130} h={60} tone="purple" title={copy.text.title4} sub={lan} mono />
        <Node x={346} y={96} w={130} h={60} tone="teal" title={copy.text.title5} sub={copy.text.sub2} mono />
        <Arrow
          points={[
            [150, 126],
            [202, 126],
          ]}
          both
        />
        <Label x={269} y={180} muted size={12}>
          {copy.text.label2}
        </Label>
        <Label x={411} y={180} muted size={12}>
          {copy.text.label3}
        </Label>
        <Label x={340} y={222} muted size={11.5}>
          {copy.text.label4}
        </Label>
        <Arrow
          points={[
            [334, 136],
            [344, 136],
          ]}
          both
        />

        <Group x={530} y={40} w={142} h={170} tone="green" label={copy.text.label5} />
        <Node x={544} y={76} w={114} h={36} tone="green" title={copy.text.title6} titleSize={12.5} />
        <Node x={544} y={118} w={114} h={36} tone="green" title={copy.text.title7} titleSize={12.5} />
        <Node x={544} y={160} w={114} h={36} tone="gray" title={copy.text.title8} titleSize={12.5} />
        <Arrow
          points={[
            [476, 126],
            [528, 126],
          ]}
          both
          label={copy.text.label6}
          labelDy={-8}
        />
      </Diagram>
    );
  }
  return TwoAddresses;
});
