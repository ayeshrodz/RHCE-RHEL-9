import { Arrow, Badge, Diagram, Group, Node, StepControls, useStepper } from '../kit';

const steps = [
  { title: 'Read the plan', text: 'Ansible parses the playbook and looks up the target hosts in the inventory.' },
  { title: 'Connect', text: 'It opens an SSH connection to servera as the configured remote user. No agent is waiting there, just sshd.' },
  {
    title: 'Ship the module',
    text: 'The code for the task’s module (here, dnf) is copied into a temporary directory on the managed host.',
  },
  {
    title: 'Execute and compare',
    text: 'The module checks the current state (is httpd installed?) and changes the system only if it does not match the desired state.',
  },
  {
    title: 'Report back',
    text: 'The module returns JSON: ok if nothing needed changing, changed if it fixed something, failed if it could not.',
  },
  {
    title: 'Clean up',
    text: 'The temporary files are removed and Ansible moves on to the next task. The host is left with no Ansible software on it.',
  },
];

/** Step-through of what happens when one task runs against one host. */
export default function TaskLifecycle() {
  const stepper = useStepper(steps.length);
  const s = stepper.step;
  const on = (...ids) => ids.includes(s);

  return (
    <Diagram height={250} title="The life of a single task" below={<StepControls stepper={stepper} steps={steps} />} expandable={false}>
      <Group x={10} y={10} w={210} h={230} tone="gray" label="Control node" active={on(0)} />
      <Node x={26} y={46} w={178} h={44} tone="purple" title="site.yml" mono active={on(0)} dim={!on(0)} />
      <Node x={26} y={100} w={178} h={44} tone="amber" title="inventory" mono active={on(0)} dim={!on(0)} />
      <Node x={26} y={154} w={178} h={62} tone="teal" title="dnf module" sub="Python code" active={on(2)} dim={!on(0, 2)} />

      <Group x={460} y={10} w={210} h={230} tone="green" label="servera" sub="managed host" active={on(1, 3)} />
      <Node
        x={476}
        y={46}
        w={178}
        h={62}
        tone="gray"
        title="~/.ansible/tmp/"
        sub={s === 5 ? 'emptied' : 'module lands here'}
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
        title="httpd package"
        sub={s >= 3 ? 'installed ✓' : 'not installed'}
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
        label="1 · SSH as remote_user"
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
        label="2 · copy module"
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
        label="3 · JSON: changed"
        labelAt={0.8}
        hot={on(4)}
        dim={!on(4)}
      />
      <Arrow
        points={[
          [222, 232],
          [458, 232],
        ]}
        label="4 · remove temp files"
        dashed
        hot={on(5)}
        dim={!on(5)}
        labelDy={-6}
      />

      <Badge x={10} y={10} n={s + 1} hot />
    </Diagram>
  );
}
