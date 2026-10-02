import { Arrow, Diagram, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('DevOpsLifecycle', (copy) => {
  const teams = copy.data.teams;

  function DevOpsLifecycle() {
    return (
      <Diagram height={196} title={copy.text.title} caption={copy.text.caption}>
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
          {copy.text.label}
        </Label>
        <Label x={656} y={28} anchor="end" muted>
          {copy.text.label2}
        </Label>
        <Node x={270} y={14} w={140} h={52} tone="purple" title={copy.text.title2} sub={copy.text.sub} />
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
  return DevOpsLifecycle;
});
