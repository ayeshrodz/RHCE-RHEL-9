import { Arrow, Diagram, Node } from '../kit';

const stages = [
  { title: 'Write', sub: 'site.yml', tone: 'purple' },
  { title: '--syntax-check', sub: 'parse only', tone: 'blue', mono: true },
  { title: '--check', sub: 'dry run', tone: 'amber', mono: true },
  { title: 'run', sub: 'make changes', tone: 'coral', mono: true },
  { title: 'run again', sub: 'expect changed=0', tone: 'green' },
];

/** The habit loop for developing a playbook safely. */
export default function SafeWorkflow() {
  const w = 116;
  const gap = 20;
  return (
    <Diagram
      height={132}
      title="A safe playbook workflow"
      caption="Catch YAML mistakes first, preview changes second, apply third, and prove idempotency last."
    >
      {stages.map((s, i) => {
        const x = 10 + i * (w + gap);
        return (
          <g key={s.title}>
            <Node x={x} y={34} w={w} h={60} tone={s.tone} title={s.title} sub={s.sub} mono={s.mono} />
            {i < stages.length - 1 && (
              <Arrow
                points={[
                  [x + w, 64],
                  [x + w + gap - 2, 64],
                ]}
              />
            )}
          </g>
        );
      })}
      <Arrow
        points={[
          [612, 94],
          [612, 116],
          [68, 116],
          [68, 96],
        ]}
        dashed
        label="fix and repeat"
        labelAt={0.5}
        labelDy={4}
      />
    </Diagram>
  );
}
