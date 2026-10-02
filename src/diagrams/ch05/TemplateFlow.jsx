import { Arrow, Diagram, Group, Node, StepControls, useStepper } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('TemplateFlow', (copy) => {
  const steps = copy.data.steps;

  function TemplateFlow() {
    const stepper = useStepper(steps.length);
    const s = stepper.step;
    const on = (...ids) => ids.includes(s);

    return (
      <Diagram height={262} title={copy.text.title} below={<StepControls stepper={stepper} steps={steps} />} expandable={false}>
        <Group x={10} y={10} w={360} h={242} tone="gray" label={copy.text.label} active={on(2)} />
        <Node x={26} y={46} w={150} h={54} tone="purple" title={copy.text.title2} sub={copy.text.sub} mono active={on(0)} dim={!on(0, 2)} />
        <Node x={26} y={118} w={150} h={48} tone="amber" title={copy.text.title3} sub={copy.text.sub2} active={on(1)} dim={!on(1, 2)} />
        <Node x={26} y={178} w={150} h={48} tone="amber" title={copy.text.title4} sub={copy.text.sub3} active={on(1)} dim={!on(1, 2)} />
        <Node x={214} y={104} w={140} h={62} tone="teal" title={copy.text.title5} sub={copy.text.sub4} active={on(2)} dim={!on(2, 3)} />
        <Arrow
          points={[
            [176, 73],
            [284, 73],
            [284, 102],
          ]}
          hot={on(2)}
          dim={!on(2)}
        />
        <Arrow
          points={[
            [176, 142],
            [212, 142],
          ]}
          hot={on(2)}
          dim={!on(2)}
        />
        <Arrow
          points={[
            [176, 202],
            [284, 202],
            [284, 168],
          ]}
          hot={on(2)}
          dim={!on(2)}
        />

        <Group x={440} y={10} w={230} h={112} tone="green" label={copy.text.label2} active={on(3, 4)} />
        <Node
          x={456}
          y={46}
          w={198}
          h={60}
          tone="green"
          title={copy.text.title6}
          sub={s === 4 ? copy.text.sub5 : copy.text.sub6}
          mono
          active={on(3, 4)}
          dim={!on(3, 4)}
        />
        <Group x={440} y={140} w={230} h={112} tone="green" label={copy.text.label3} active={on(3, 4)} />
        <Node
          x={456}
          y={176}
          w={198}
          h={60}
          tone="green"
          title={copy.text.title7}
          sub={s === 4 ? copy.text.sub7 : copy.text.sub8}
          mono
          active={on(3, 4)}
          dim={!on(3, 4)}
        />
        <Arrow
          points={[
            [354, 124],
            [400, 124],
            [400, 76],
            [454, 76],
          ]}
          label={copy.text.label4}
          labelAt={0.12}
          hot={on(3)}
          dim={!on(3, 4)}
          dashed={s === 4}
        />
        <Arrow
          points={[
            [354, 146],
            [400, 146],
            [400, 206],
            [454, 206],
          ]}
          label={copy.text.label5}
          labelAt={0.12}
          hot={on(3)}
          dim={!on(3, 4)}
          dashed={s === 4}
        />
      </Diagram>
    );
  }
  return TemplateFlow;
});
