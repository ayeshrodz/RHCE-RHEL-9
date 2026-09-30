import { Arrow, Diagram, Group, Node } from '../kit';

/** How ansible-navigator runs a playbook inside an execution environment container. */
export default function NavigatorRuntime() {
  return (
    <Diagram
      height={300}
      title="How ansible-navigator runs a playbook"
      caption="ansible-navigator starts the execution environment with Podman, mounts your project into it, and the container connects to the managed hosts."
    >
      <Node x={372} y={8} w={160} h={52} tone="blue" title="Container registry" sub="EE images" />
      <Arrow
        points={[
          [452, 60],
          [452, 120],
        ]}
        label="podman pull (once)"
        labelAnchor="end"
        labelDx={-8}
        labelDy={-4}
      />

      <Group x={10} y={84} w={540} h={206} tone="gray" label="Control node (workstation)" />
      <Node x={30} y={122} w={170} h={62} tone="amber" title="ansible-navigator" sub="you run: run site.yml" />
      <Node x={30} y={204} w={170} h={62} tone="purple" title="Project directory" sub="site.yml, inventory, cfg" />
      <Arrow
        points={[
          [200, 153],
          [370, 153],
        ]}
        label="starts container"
      />
      <Arrow
        points={[
          [200, 235],
          [370, 235],
        ]}
        label="mounted inside"
      />
      <Node
        x={372}
        y={122}
        w={160}
        h={144}
        tone="teal"
        title="EE container"
        sub={['ansible-core', 'collections', 'Python libraries', 'runs as root']}
      />

      <Group x={566} y={84} w={104} h={206} tone="green" label="Hosts" />
      <Node x={578} y={122} w={80} h={56} tone="green" title="servera" />
      <Node x={578} y={206} w={80} h={56} tone="green" title="serverb" />
      <Arrow
        points={[
          [532, 150],
          [576, 150],
        ]}
        label="SSH"
      />
      <Arrow
        points={[
          [532, 234],
          [576, 234],
        ]}
        label="SSH"
      />
    </Diagram>
  );
}
