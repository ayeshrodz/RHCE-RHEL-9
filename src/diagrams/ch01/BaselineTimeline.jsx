import { Arrow, Diagram, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('BaselineTimeline', (copy) => {
  function BaselineTimeline() {
    const steps = [
      { x: 8, title: copy.text.title, sub: copy.text.sub, tone: 'gray' },
      { x: 142, title: copy.text.title2, sub: copy.text.sub2, tone: 'gray' },
      { x: 276, title: copy.text.title3, sub: copy.text.sub3, tone: 'gray' },
    ];
    return (
      <Diagram height={170} title={copy.text.title4} caption={copy.text.caption}>
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
        <Node x={420} y={30} w={116} h={76} tone="coral" title={copy.text.title5} sub={[copy.text.sub4, copy.text.sub5]} active />
        <Arrow
          points={[
            [536, 68],
            [556, 68],
          ]}
        />
        <Node x={558} y={40} w={114} h={56} tone="purple" title={copy.text.title6} sub={copy.text.sub6} titleSize={13} />

        <Arrow
          points={[
            [615, 96],
            [615, 140],
            [478, 140],
            [478, 108],
          ]}
          dashed
          label={copy.text.label}
          labelAt={0.5}
          labelDy={-6}
        />
        <Label x={16} y={24} anchor="start" muted size={11.5}>
          {copy.text.label2}
        </Label>
        <Label x={150} y={24} anchor="start" muted size={11.5}>
          {copy.text.label3}
        </Label>
        <Label x={284} y={24} anchor="start" muted size={11.5}>
          {copy.text.label4}
        </Label>
        <Label x={566} y={24} anchor="start" muted size={11.5}>
          {copy.text.label5}
        </Label>
      </Diagram>
    );
  }
  return BaselineTimeline;
});
