import { Arrow, Badge, Diagram, Group, Node, StepControls, useStepper } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('TaskLifecycle', (copy) => {
  const steps = copy.data.steps;

  function TaskLifecycle() {
    const stepper = useStepper(steps.length);
    const s = stepper.step;
    const on = (...ids) => ids.includes(s);

    return (
      <Diagram height={250} title={copy.text.title} below={<StepControls stepper={stepper} steps={steps} />} expandable={false}>
        <Group x={10} y={10} w={210} h={230} tone="gray" label={copy.text.label} active={on(0)} />
        <Node x={26} y={46} w={178} h={44} tone="purple" title={copy.text.title2} mono active={on(0)} dim={!on(0)} />
        <Node x={26} y={100} w={178} h={44} tone="amber" title={copy.text.title3} mono active={on(0)} dim={!on(0)} />
        <Node x={26} y={154} w={178} h={62} tone="teal" title={copy.text.title4} sub={copy.text.sub} active={on(2)} dim={!on(0, 2)} />

        <Group x={460} y={10} w={210} h={230} tone="green" label={copy.text.label2} sub={copy.text.sub2} active={on(1, 3)} />
        <Node
          x={476}
          y={46}
          w={178}
          h={62}
          tone="gray"
          title={copy.text.title5}
          sub={s === 5 ? copy.text.sub3 : copy.text.sub4}
          mono
          active={on(2, 5)}
          dim={!on(2, 3, 5)}
        />
        <Node
          x={476}
          y={144}
          w={178}
          h={62}
          tone="green"
          title={copy.text.title6}
          sub={s >= 3 ? copy.text.sub5 : copy.text.sub6}
          active={on(3)}
          dim={!on(3, 4)}
        />
        <Arrow
          points={[
            [565, 110],
            [565, 140],
          ]}
          hot={on(3)}
          dim={!on(3)}
        />

        <Arrow
          points={[
            [222, 40],
            [458, 40],
          ]}
          label={copy.text.label3}
          hot={on(1)}
          dim={!on(1)}
        />
        <Arrow
          points={[
            [206, 185],
            [340, 185],
            [340, 77],
            [474, 77],
          ]}
          label={copy.text.label4}
          labelAt={0.62}
          hot={on(2)}
          dim={!on(2)}
        />
        <Arrow
          points={[
            [458, 175],
            [360, 175],
            [360, 210],
            [222, 210],
          ]}
          label={copy.text.label5}
          labelAt={0.8}
          hot={on(4)}
          dim={!on(4)}
        />
        <Arrow
          points={[
            [222, 232],
            [458, 232],
          ]}
          label={copy.text.label6}
          dashed
          hot={on(5)}
          dim={!on(5)}
          labelDy={-6}
        />

        <Badge x={10} y={10} n={s + 1} hot />
      </Diagram>
    );
  }
  return TaskLifecycle;
});
