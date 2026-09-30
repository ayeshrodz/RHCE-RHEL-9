import { Arrow, Diagram, Label, Node } from '../kit';

const teams = [
  { title: 'Dev / Test', sub: 'writes it', tone: 'blue' },
  { title: 'QA', sub: 'verifies it', tone: 'teal' },
  { title: 'Operations', sub: 'runs it', tone: 'green' },
  { title: 'Management', sub: 'audits it', tone: 'amber' },
  { title: 'Outsourcers', sub: 'reuse it', tone: 'pink' },
];

/** One playbook, read and run by every team across the application lifecycle. */
export default function DevOpsLifecycle() {
  return (
    <Diagram
      height={196}
      title="Ansible across the application lifecycle"
      caption="Every team reads the same human-readable playbook, from development through to production."
    >
      <Arrow
        points={[
          [268, 40],
          [22, 40],
        ]}
      />
      <Arrow
        points={[
          [412, 40],
          [658, 40],
        ]}
      />
      <Label x={24} y={28} anchor="start" muted>
        from development…
      </Label>
      <Label x={656} y={28} anchor="end" muted>
        …to production
      </Label>
      <Node x={270} y={14} w={140} h={52} tone="purple" title="Ansible Playbook" sub="one shared language" />
      {teams.map((t, i) => {
        const x = 20 + i * 130;
        const cx = x + 60;
        return (
          <g key={t.title}>
            <Arrow
              points={[
                [340, 66],
                [340, 90],
                [cx, 90],
                [cx, 118],
              ]}
              dashed
            />
            <Node x={x} y={120} w={120} h={58} tone={t.tone} title={t.title} sub={t.sub} />
          </g>
        );
      })}
    </Diagram>
  );
}
