import { Arrow, Diagram, Group, Node, StepControls, useStepper } from '../kit';

const steps = [
  { title: 'One template', text: 'templates/motd.j2 lives in the project on the control node. It is plain text with {{ }} placeholders.' },
  { title: 'Per-host data', text: 'For each host in the play, Ansible has that host’s own variables and gathered facts.' },
  {
    title: 'Render on the control node',
    text: 'The template module fills in the placeholders once per host. The managed hosts never see Jinja2 syntax, and do not need Jinja2 installed.',
  },
  { title: 'Copy the result', text: 'Each host receives its own finished file, with the owner, group and mode the task asked for.' },
  {
    title: 'Run again: nothing to do',
    text: 'The rendered text is compared with the file already on the host. Identical content means ok, not changed, so handlers are not notified.',
  },
];

/** One template becomes a different file on every host. */
export default function TemplateFlow() {
  const stepper = useStepper(steps.length);
  const s = stepper.step;
  const on = (...ids) => ids.includes(s);

  return (
    <Diagram
      height={262}
      title="One template, a different file on every host"
      below={<StepControls stepper={stepper} steps={steps} />}
      expandable={false}
    >
      <Group x={10} y={10} w={360} h={242} tone="gray" label="Control node" active={on(2)} />
      <Node
        x={26}
        y={46}
        w={150}
        h={54}
        tone="purple"
        title="templates/motd.j2"
        sub="{{ ansible_facts['fqdn'] }}"
        mono
        active={on(0)}
        dim={!on(0, 2)}
      />
      <Node x={26} y={118} w={150} h={48} tone="amber" title="servera" sub="facts + variables" active={on(1)} dim={!on(1, 2)} />
      <Node x={26} y={178} w={150} h={48} tone="amber" title="serverb" sub="facts + variables" active={on(1)} dim={!on(1, 2)} />
      <Node x={214} y={104} w={140} h={62} tone="teal" title="template" sub="render per host" active={on(2)} dim={!on(2, 3)} />
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

      <Group x={440} y={10} w={230} h={112} tone="green" label="servera" active={on(3, 4)} />
      <Node
        x={456}
        y={46}
        w={198}
        h={60}
        tone="green"
        title="/etc/motd"
        sub={s === 4 ? 'same content → ok' : 'This is the system servera…'}
        mono
        active={on(3, 4)}
        dim={!on(3, 4)}
      />
      <Group x={440} y={140} w={230} h={112} tone="green" label="serverb" active={on(3, 4)} />
      <Node
        x={456}
        y={176}
        w={198}
        h={60}
        tone="green"
        title="/etc/motd"
        sub={s === 4 ? 'same content → ok' : 'This is the system serverb…'}
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
        label="copy"
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
        label="copy"
        labelAt={0.12}
        hot={on(3)}
        dim={!on(3, 4)}
        dashed={s === 4}
      />
    </Diagram>
  );
}
