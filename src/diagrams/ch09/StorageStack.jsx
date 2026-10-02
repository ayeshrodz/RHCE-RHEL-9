import { Arrow, Diagram, Label, Node, StepControls, useStepper } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('StorageStack', (copy) => {
  const steps = copy.data.steps;

  function StorageStack() {
    const stepper = useStepper(steps.length);
    const s = stepper.step;
    const on = (n) => s >= n;
    const hot = (n) => s === n;
    const X = 160;
    const W = 360;

    return (
      <Diagram height={320} title={copy.text.title} below={<StepControls stepper={stepper} steps={steps} />} expandable={false}>
        <Node x={X} y={262} w={W} h={44} tone="gray" title={copy.text.title2} sub={copy.text.sub} mono active={hot(0)} />
        <Node x={X} y={210} w={200} h={40} tone="amber" title={copy.text.title3} sub={copy.text.sub2} mono active={hot(1)} dim={!on(1)} />
        <Node x={X} y={158} w={W} h={40} tone="purple" title={copy.text.title4} mono active={hot(2)} dim={!on(2)} />
        <Node x={X} y={106} w={220} h={40} tone="teal" title={copy.text.title5} sub={copy.text.sub3} mono active={hot(3)} dim={!on(3)} />
        <Node x={X} y={54} w={220} h={40} tone="blue" title={copy.text.title6} mono active={hot(4)} dim={!on(4)} />
        <Node x={X} y={4} w={220} h={40} tone="green" title={copy.text.title7} sub={copy.text.sub4} mono active={hot(5)} dim={!on(5)} />

        {[
          [1, 'community.general.parted', 230],
          [2, 'community.general.lvg', 178],
          [3, 'community.general.lvol', 126],
          [4, 'community.general.filesystem', 74],
          [5, 'ansible.posix.mount', 24],
        ].map(([n, mod, y]) => (
          <Label key={n} x={X + W + 16} y={y + 4} anchor="start" mono size={12} muted={!hot(n)}>
            {mod}
          </Label>
        ))}
        {[1, 2, 3, 4, 5].map((n) => (
          <Arrow
            key={n}
            points={[
              [X + W + 10, 238 - (n - 1) * 52 + (n === 1 ? 26 : 0)],
              [X + W + 10, 214 - (n - 1) * 52 + (n === 1 ? 26 : 0)],
            ]}
            dim={!on(n)}
            hot={hot(n)}
          />
        ))}
        <Label x={X - 16} y={286} anchor="end" muted size={12}>
          {copy.text.label}
        </Label>
        <Label x={X - 16} y={182} anchor="end" muted size={12}>
          {copy.text.label2}
        </Label>
        <Label x={X - 16} y={30} anchor="end" muted size={12}>
          {copy.text.label3}
        </Label>
      </Diagram>
    );
  }
  return StorageStack;
});
