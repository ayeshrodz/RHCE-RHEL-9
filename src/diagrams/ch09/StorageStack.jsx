import { Arrow, Diagram, Label, Node, StepControls, useStepper } from '../kit';

const steps = [
  { title: 'A blank disk', text: '/dev/sdb: 5 GiB, no partition table. On the home lab it is sdb; on many other systems vdb or nvme1n1.' },
  { title: 'Partition', text: 'community.general.parted creates /dev/sdb1 and marks it for LVM. part_end sets its size.' },
  { title: 'Volume group', text: 'community.general.lvg turns sdb1 into a physical volume and builds the volume group apps from it.' },
  {
    title: 'Logical volume',
    text: 'community.general.lvol carves the logical volume data (500 MiB) out of the group. Later you can grow it.',
  },
  {
    title: 'File system',
    text: 'community.general.filesystem puts XFS on /dev/apps/data. It never reformats a device that already has a file system.',
  },
  {
    title: 'Mount',
    text: 'ansible.posix.mount with state: mounted mounts it on /srv/data now and writes the line to /etc/fstab for every boot.',
  },
];

/** Step through the layers from a blank disk to a mounted file system. */
export default function StorageStack() {
  const stepper = useStepper(steps.length);
  const s = stepper.step;
  const on = (n) => s >= n;
  const hot = (n) => s === n;
  const X = 160;
  const W = 360;

  return (
    <Diagram
      height={320}
      title="From a blank disk to a mounted file system"
      below={<StepControls stepper={stepper} steps={steps} />}
      expandable={false}
    >
      <Node x={X} y={262} w={W} h={44} tone="gray" title="/dev/sdb" sub="5 GiB disk" mono active={hot(0)} />
      <Node x={X} y={210} w={200} h={40} tone="amber" title="/dev/sdb1" sub="1 GiB, LVM" mono active={hot(1)} dim={!on(1)} />
      <Node x={X} y={158} w={W} h={40} tone="purple" title="volume group: apps" mono active={hot(2)} dim={!on(2)} />
      <Node x={X} y={106} w={220} h={40} tone="teal" title="/dev/apps/data" sub="500 MiB" mono active={hot(3)} dim={!on(3)} />
      <Node x={X} y={54} w={220} h={40} tone="blue" title="XFS" mono active={hot(4)} dim={!on(4)} />
      <Node x={X} y={4} w={220} h={40} tone="green" title="/srv/data" sub="mounted, in /etc/fstab" mono active={hot(5)} dim={!on(5)} />

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
        disk
      </Label>
      <Label x={X - 16} y={182} anchor="end" muted size={12}>
        LVM
      </Label>
      <Label x={X - 16} y={30} anchor="end" muted size={12}>
        what users see
      </Label>
    </Diagram>
  );
}
