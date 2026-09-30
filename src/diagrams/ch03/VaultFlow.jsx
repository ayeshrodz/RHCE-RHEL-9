import { Arrow, Badge, Diagram, Group, Label, Node } from '../kit';

/** Plaintext → encrypted file in Git → decrypted in memory at run time. */
export default function VaultFlow() {
  return (
    <Diagram
      height={300}
      title="How Ansible Vault protects a secret"
      caption="The secret is only ever stored encrypted. ansible-navigator decrypts it in memory while the playbook runs, using a password you supply."
    >
      <Node x={10} y={40} w={150} h={96} tone="coral" title="secret.yml" sub={['plain text', 'web_pass: redhat']} />
      <Badge x={10} y={40} n={1} />
      <Arrow
        points={[
          [160, 88],
          [236, 88],
        ]}
        label="encrypt"
        hot
      />

      <Node
        x={238}
        y={40}
        w={196}
        h={96}
        tone="gray"
        title="secret.yml"
        sub={['$ANSIBLE_VAULT;1.1;AES256', '6231386563383461653…', 'safe to commit to Git']}
        mono
        titleSize={13}
      />
      <Badge x={238} y={40} n={2} />

      <Node x={494} y={24} w={176} h={52} tone="purple" title="Vault password" sub="prompt or password file" />
      <Arrow
        points={[
          [582, 76],
          [582, 176],
        ]}
        dashed
        label="unlocks"
        labelAnchor="start"
        labelDx={8}
        labelDy={4}
      />

      <Arrow
        points={[
          [336, 136],
          [336, 206],
          [490, 206],
        ]}
        label="read at run time"
        labelAt={0.75}
      />

      <Group x={492} y={176} w={180} h={116} tone="teal" label="ansible-navigator run" solid />
      <Badge x={492} y={176} n={3} />
      <Node x={506} y={210} w={152} h={66} tone="teal" title="web_pass = redhat" sub="decrypted in memory only" titleSize={13} />

      <Label x={130} y={200} anchor="middle" muted size={12}>
        Never on disk in plain text,
      </Label>
      <Label x={130} y={218} anchor="middle" muted size={12}>
        never in Git history.
      </Label>
    </Diagram>
  );
}
