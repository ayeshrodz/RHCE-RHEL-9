import { Arrow, Diagram, Group, Node } from '../kit';

/** How you reach the lab day to day. */
export default function AccessPaths() {
  return (
    <Diagram
      height={170}
      title="Getting into the lab"
      caption="SSH to the host as usual, step into workstation with lxc exec, then work exactly as in the classroom. The ssh rhce shortcut does the first two hops in one command."
    >
      <Node x={8} y={50} w={130} h={60} tone="gray" title="Your computer" sub="laptop / desktop" />
      <Arrow
        points={[
          [138, 80],
          [182, 80],
        ]}
        label="ssh"
      />
      <Node x={184} y={50} w={130} h={60} tone="purple" title="Ubuntu host" sub="rht-vmctl, lxc" />
      <Arrow
        points={[
          [314, 80],
          [362, 80],
        ]}
        label="lxc exec"
      />
      <Group x={364} y={10} w={308} h={150} tone="green" label="Sealed lab" />
      <Node x={380} y={50} w={120} h={60} tone="green" title="workstation" sub="student" />
      <Arrow
        points={[
          [500, 80],
          [540, 80],
        ]}
        label="ssh · ansible"
      />
      <Node x={542} y={36} w={116} h={40} tone="green" title="servera" titleSize={12.5} />
      <Node x={542} y={84} w={116} h={40} tone="green" title="serverb…d" titleSize={12.5} />
      <Arrow
        points={[
          [8, 140],
          [8, 150],
          [440, 150],
          [440, 112],
        ]}
        dashed
        label="ssh rhce  (RemoteCommand)"
        labelAt={0.35}
        labelDy={-6}
      />
    </Diagram>
  );
}
