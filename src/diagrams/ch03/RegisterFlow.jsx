import { Arrow, Diagram, Group, Label, Node } from '../kit';

/** A task's JSON result is captured by `register` and used by later tasks. */
export default function RegisterFlow() {
  return (
    <Diagram
      height={250}
      title="Capturing a task result with register"
      caption="Every module returns a JSON result. register saves it as a variable, so later tasks can print it, test it or reuse it."
    >
      <Group x={8} y={8} w={220} h={234} tone="purple" label="Task 1" />
      <Node x={24} y={44} w={188} h={52} tone="teal" title="ansible.builtin.dnf" sub="name: httpd" mono />
      <Node x={24} y={170} w={188} h={52} tone="purple" title="register: install_result" mono titleSize={12.5} />
      <Arrow
        points={[
          [118, 96],
          [118, 168],
        ]}
        label="returns"
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
        title="install_result"
        sub={['changed: false', 'rc: 0', 'msg: ""', 'results: [ … ]']}
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

      <Group x={494} y={8} w={178} h={234} tone="amber" label="Later tasks" />
      <Node x={508} y={44} w={150} h={52} tone="amber" title="debug" sub="var: install_result" />
      <Node x={508} y={106} w={150} h={52} tone="amber" title="when:" sub="install_result.changed" />
      <Node x={508} y={168} w={150} h={52} tone="amber" title="msg:" sub="{{ install_result.rc }}" />
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
        (when: is covered in chapter 4)
      </Label>
    </Diagram>
  );
}
