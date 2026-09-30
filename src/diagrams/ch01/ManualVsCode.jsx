import { Arrow, Diagram, Group, Label, Node } from '../kit';

/** Manual administration drifts; Infrastructure as Code converges. */
export default function ManualVsCode() {
  const manual = [70, 170, 270];
  const code = [410, 510, 610];
  return (
    <Diagram
      height={300}
      title="Manual administration versus Infrastructure as Code"
      caption="Hand-applied changes slowly drift apart. Changes made through code are reviewed once and applied identically everywhere."
    >
      <Group x={10} y={10} w={320} h={280} tone="coral" label="Manual administration" />
      <Node x={100} y={48} w={140} h={54} tone="gray" title="Administrator" sub="checklist + SSH" />
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
        by hand, one by one
      </Label>
      <Node x={25} y={188} w={90} h={56} tone="gray" title="web1" sub="httpd 2.4.57" />
      <Node x={125} y={188} w={90} h={56} tone="red" title="web2" sub="httpd 2.4.53" />
      <Node x={225} y={188} w={90} h={56} tone="gray" title="web3" sub="httpd 2.4.57" />
      <Label x={170} y={272} muted>
        web2 missed a step. Nobody noticed.
      </Label>

      <Group x={350} y={10} w={320} h={280} tone="teal" label="Infrastructure as Code" />
      <Node x={366} y={48} w={130} h={54} tone="purple" title="Git repository" sub="site.yml" />
      <Node x={524} y={48} w={130} h={54} tone="teal" title="Ansible" sub="control node" />
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
      <Node x={365} y={188} w={90} h={56} tone="green" title="web1" sub="httpd 2.4.57" />
      <Node x={465} y={188} w={90} h={56} tone="green" title="web2" sub="httpd 2.4.57" />
      <Node x={565} y={188} w={90} h={56} tone="green" title="web3" sub="httpd 2.4.57" />
      <Label x={510} y={272} muted>
        Same code, same result, every run.
      </Label>
    </Diagram>
  );
}
