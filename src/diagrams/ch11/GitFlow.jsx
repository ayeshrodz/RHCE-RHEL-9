import { Arrow, Badge, Diagram, Group, Node, StepControls, useStepper } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

// Which places light up for each kind of step.
const ACTIVE = {
  down: ['wt', 'repo', 'remote'],
  edit: ['wt'],
  add: ['wt', 'stage'],
  commit: ['stage', 'repo'],
  push: ['repo', 'remote'],
};

export default defineWidget('GitFlow', (copy) => {
  const steps = copy.data.steps;

  function GitFlow() {
    const stepper = useStepper(steps.length);
    const { hot, subs } = steps[stepper.step];
    const node = (key, index) => ({ active: ACTIVE[hot].includes(key), dim: !ACTIVE[hot].includes(key), sub: subs[index] });

    return (
      <Diagram height={230} title={copy.text.title} below={<StepControls stepper={stepper} steps={steps} />}>
        <Group x={10} y={10} w={480} h={210} tone="gray" label={copy.text.label} />
        <Group x={516} y={10} w={154} h={210} tone="blue" label={copy.text.label2} />

        <Node x={26} y={88} w={128} h={80} tone="teal" title={copy.text.title2} {...node('wt', 0)} />
        <Node x={184} y={88} w={128} h={80} tone="amber" title={copy.text.title3} {...node('stage', 1)} />
        <Node x={342} y={88} w={132} h={80} tone="purple" title={copy.text.title4} {...node('repo', 2)} />
        <Node x={529} y={88} w={128} h={80} tone="blue" title={copy.text.title5} {...node('remote', 3)} />

        <Arrow
          points={[
            [110, 86],
            [110, 62],
            [228, 62],
            [228, 86],
          ]}
          label={copy.text.label3}
          hot={hot === 'add'}
          dim={hot !== 'add'}
        />
        <Arrow
          points={[
            [268, 86],
            [268, 62],
            [386, 62],
            [386, 86],
          ]}
          label={copy.text.label4}
          hot={hot === 'commit'}
          dim={hot !== 'commit'}
        />
        <Arrow
          points={[
            [430, 86],
            [430, 62],
            [593, 62],
            [593, 86],
          ]}
          label={copy.text.label5}
          labelAt={0.34}
          hot={hot === 'push'}
          dim={hot !== 'push'}
        />
        <Arrow
          points={[
            [593, 170],
            [593, 198],
            [90, 198],
            [90, 170],
          ]}
          label={copy.text.label6}
          hot={hot === 'down'}
          dim={hot !== 'down'}
        />

        <Badge x={10} y={10} n={stepper.step + 1} hot />
      </Diagram>
    );
  }
  return GitFlow;
});
