import { Arrow, Diagram, Label, Node } from '../kit';

/** From the control node user to a task running as root, labelled with the ansible.cfg directives involved. */
export default function PrivilegeEscalation() {
  return (
    <Diagram
      height={212}
      title="Connecting and escalating privileges"
      caption="Ansible logs in as the remote user with an SSH key, then uses sudo to become root before running the task."
    >
      <Node x={16} y={56} w={130} h={64} tone="gray" title="student" sub="on workstation" />
      <Arrow
        points={[
          [146, 88],
          [222, 88],
        ]}
        label="SSH key"
      />
      <Node x={224} y={56} w={130} h={64} tone="blue" title="someuser" sub="on servera" />
      <Arrow
        points={[
          [354, 88],
          [424, 88],
        ]}
        label="sudo"
      />
      <Node x={426} y={56} w={110} h={64} tone="coral" title="root" sub="on servera" />
      <Arrow
        points={[
          [536, 88],
          [572, 88],
        ]}
      />
      <Node x={574} y={56} w={92} h={64} tone="teal" title="task" sub="runs as root" />

      <Label x={81} y={146} mono muted>
        ask_pass = false
      </Label>
      <Label x={289} y={146} mono muted>
        remote_user = someuser
      </Label>
      <Label x={481} y={146} mono muted>
        become_user = root
      </Label>
      <Label x={340} y={188} mono muted>
        become = true · become_method = sudo · become_ask_pass = false
      </Label>
      <Label x={340} y={30} muted>
        [defaults] controls the connection · [privilege_escalation] controls sudo
      </Label>
    </Diagram>
  );
}
