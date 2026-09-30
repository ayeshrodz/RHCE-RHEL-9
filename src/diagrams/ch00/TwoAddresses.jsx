import { Arrow, Diagram, Group, Label, Node } from '../kit';
import { usePlaceholderValues } from '@/lib/placeholders';

/** The host sits on two networks at once, like a home router. */
export default function TwoAddresses() {
  const [values] = usePlaceholderValues();
  const lan = values.HOST_LAN_IP?.trim() || '<HOST_LAN_IP>';
  return (
    <Diagram
      height={250}
      title="Why the host has two IP addresses"
      caption="The host keeps its normal LAN address (wired or Wi-Fi) and gains a second one, 172.25.250.254, on the lab's virtual switch. The VMs use that second address as their gateway."
    >
      <Node x={10} y={20} w={140} h={46} tone="blue" title="Internet" />
      <Node x={10} y={100} w={140} h={52} tone="gray" title="Your router" sub="LAN gateway" />
      <Arrow
        points={[
          [80, 66],
          [80, 98],
        ]}
        both
      />

      <Group x={188} y={10} w={304} h={230} tone="purple" label="Ubuntu host" />
      <Node x={204} y={96} w={130} h={60} tone="purple" title="LAN card" sub={lan} mono />
      <Node x={346} y={96} w={130} h={60} tone="teal" title="rhcebr0" sub="172.25.250.254" mono />
      <Arrow
        points={[
          [150, 126],
          [202, 126],
        ]}
        both
      />
      <Label x={269} y={180} muted size={12}>
        faces your network
      </Label>
      <Label x={411} y={180} muted size={12}>
        faces the lab only
      </Label>
      <Label x={340} y={222} muted size={11.5}>
        the host forwards (NAT) between the two
      </Label>
      <Arrow
        points={[
          [334, 136],
          [344, 136],
        ]}
        both
      />

      <Group x={530} y={40} w={142} h={170} tone="green" label="Lab VMs" />
      <Node x={544} y={76} w={114} h={36} tone="green" title="workstation" titleSize={12.5} />
      <Node x={544} y={118} w={114} h={36} tone="green" title="servera…d" titleSize={12.5} />
      <Node x={544} y={160} w={114} h={36} tone="gray" title="utility" titleSize={12.5} />
      <Arrow
        points={[
          [476, 126],
          [528, 126],
        ]}
        both
        label="gateway"
        labelDy={-8}
      />
    </Diagram>
  );
}
