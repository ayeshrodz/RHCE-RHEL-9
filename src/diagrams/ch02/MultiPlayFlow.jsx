import { Arrow, Badge, Diagram, Node } from '../kit';

/** The two-play intranet.yml from the guided exercise, as a flow. */
export default function MultiPlayFlow() {
  return (
    <Diagram
      height={236}
      title="A playbook with two plays"
      caption="Plays run in order. The first configures servera with root privileges; the second runs on localhost (inside the execution environment) to test the result."
    >
      <Node x={10} y={88} w={130} h={60} tone="purple" title="intranet.yml" sub="2 plays" mono />
      <Arrow
        points={[
          [140, 118],
          [168, 118],
          [168, 58],
          [198, 58],
        ]}
      />
      <Arrow
        points={[
          [140, 118],
          [168, 118],
          [168, 178],
          [198, 178],
        ]}
      />

      <Node
        x={200}
        y={20}
        w={250}
        h={76}
        tone="blue"
        title="Play 1: Enable intranet services"
        sub={['hosts: servera.lab.example.com', 'become: true']}
      />
      <Badge x={200} y={20} n={1} />
      <Arrow
        points={[
          [450, 58],
          [518, 58],
        ]}
        label="SSH + sudo"
      />
      <Node x={520} y={28} w={150} h={60} tone="green" title="servera" sub="httpd, firewalld" />

      <Node
        x={200}
        y={140}
        w={250}
        h={76}
        tone="teal"
        title="Play 2: Test intranet web server"
        sub={['hosts: localhost', 'become: false']}
      />
      <Badge x={200} y={140} n={2} />
      <Arrow
        points={[
          [450, 178],
          [518, 178],
        ]}
        label="local"
      />
      <Node x={520} y={148} w={150} h={60} tone="gray" title="localhost" sub="the EE container" />
      <Arrow
        points={[
          [595, 148],
          [595, 90],
        ]}
        dashed
        label="HTTP GET → 200"
        labelAnchor="end"
        labelDx={-8}
        labelDy={4}
      />
    </Diagram>
  );
}
