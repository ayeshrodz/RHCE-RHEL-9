import { Arrow, Diagram, Label, Node } from '../kit';

/** When to take the clean snapshot: after the tools, before any Ansible work. */
export default function BaselineTimeline() {
  const steps = [
    { x: 8, title: 'VMs built', sub: 'checks pass', tone: 'gray' },
    { x: 142, title: 'Tools installed', sub: 'navigator · SSH keys', tone: 'gray' },
    { x: 276, title: 'utility', sub: 'optional', tone: 'gray' },
  ];
  return (
    <Diagram
      height={170}
      title="When to take the clean snapshot"
      caption="clean is the state every reset returns to. Take it once the machines and tools are ready, but before you create any Ansible project."
    >
      {steps.map((s, i) => (
        <g key={s.title}>
          <Node x={s.x} y={40} w={118} h={56} tone={s.tone} title={s.title} sub={s.sub} titleSize={13} />
          {i < steps.length - 1 && (
            <Arrow
              points={[
                [s.x + 118, 68],
                [s.x + 140, 68],
              ]}
            />
          )}
        </g>
      ))}
      <Arrow
        points={[
          [394, 68],
          [418, 68],
        ]}
        hot
      />
      <Node x={420} y={30} w={116} h={76} tone="coral" title="rht-vmctl save" sub={['snapshot', '= clean']} active />
      <Arrow
        points={[
          [536, 68],
          [556, 68],
        ]}
      />
      <Node x={558} y={40} w={114} h={56} tone="purple" title="~/ansible" sub="your exercises" titleSize={13} />

      <Arrow
        points={[
          [615, 96],
          [615, 140],
          [478, 140],
          [478, 108],
        ]}
        dashed
        label="rht-vmctl reset servers"
        labelAt={0.5}
        labelDy={-6}
      />
      <Label x={16} y={24} anchor="start" muted size={11.5}>
        Phases 08–09
      </Label>
      <Label x={150} y={24} anchor="start" muted size={11.5}>
        Phase 10
      </Label>
      <Label x={284} y={24} anchor="start" muted size={11.5}>
        Phase 11
      </Label>
      <Label x={566} y={24} anchor="start" muted size={11.5}>
        Phase 13 onwards
      </Label>
    </Diagram>
  );
}
