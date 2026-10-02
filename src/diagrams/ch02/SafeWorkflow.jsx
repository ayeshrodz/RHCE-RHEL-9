import { Arrow, Diagram, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('SafeWorkflow', (copy) => {
  const stages = copy.data.stages;

  function SafeWorkflow() {
    const w = 116;
    const gap = 20;
    return (
      <Diagram height={132} title={copy.text.title} caption={copy.text.caption}>
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
          label={copy.text.label}
          labelAt={0.5}
          labelDy={4}
        />
      </Diagram>
    );
  }
  return SafeWorkflow;
});
