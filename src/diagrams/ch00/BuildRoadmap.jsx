import { Link } from 'react-router-dom';
import { Globe, Monitor, Server, SquareTerminal } from 'lucide-react';

const WHERE = {
  host: { icon: SquareTerminal, label: 'Host', tone: 'purple' },
  ui: { icon: Globe, label: 'LXD UI', tone: 'blue' },
  vm: { icon: Server, label: 'VM', tone: 'green' },
  you: { icon: Monitor, label: 'Your PC', tone: 'gray' },
};

const PHASES = [
  { n: '01', title: 'Prepare the Ubuntu host', min: 15, where: ['host'], slug: 'prepare-host' },
  { n: '02', title: 'Open the LXD UI', min: 5, where: ['ui', 'host'], slug: 'prepare-host' },
  { n: '03', title: 'Create the lab network', min: 5, where: ['ui'], slug: 'network-and-seal' },
  { n: '04', title: 'Seal the lab network', min: 10, where: ['host'], slug: 'network-and-seal' },
  { n: '05', title: 'Create the rhce project', min: 2, where: ['ui', 'host'], slug: 'project-profile-disks' },
  { n: '06', title: 'Set up the lab profile', min: 10, where: ['ui'], slug: 'project-profile-disks' },
  { n: '07', title: 'Create the extra disks', min: 5, where: ['ui'], slug: 'project-profile-disks' },
  { n: '08', title: 'Create the VMs', min: 20, where: ['ui'], slug: 'create-and-verify-vms' },
  { n: '09', title: 'Get inside and check', min: 10, where: ['host', 'vm'], slug: 'create-and-verify-vms' },
  { n: '10', title: 'Prepare the control node', min: 15, where: ['vm'], slug: 'control-node' },
  { n: '11', title: 'Utility server (optional)', min: 10, where: ['host', 'vm'], slug: 'control-node' },
  { n: '12', title: 'Snapshots and rht-vmctl', min: 10, where: ['host'], slug: 'snapshots-and-rht-vmctl' },
  { n: '13', title: 'Your first Ansible project', min: 10, where: ['vm'], slug: 'first-project-and-daily-use' },
  { n: '14', title: 'Daily use', min: 0, where: ['you', 'host'], slug: 'first-project-and-daily-use' },
];

/** All build phases at a glance, with where each happens and roughly how long it takes. */
export default function BuildRoadmap() {
  const total = PHASES.reduce((s, p) => s + p.min, 0);
  return (
    <div className="widget roadmap">
      <div className="roadmap-head">
        <p className="widget-title">The build, phase by phase</p>
        <span className="pill">about {Math.round(total / 5) * 5} minutes in total</span>
      </div>
      <div className="roadmap-legend">
        {Object.values(WHERE).map(({ icon: Icon, label, tone }) => (
          <span key={label} className={`roadmap-where t-${tone}`}>
            <Icon size={12} /> {label}
          </span>
        ))}
      </div>
      <ol className="roadmap-list">
        {PHASES.map((p) => (
          <li key={p.n}>
            <Link to={`/ch00/${p.slug}`} className="roadmap-item">
              <span className="roadmap-n">{p.n}</span>
              <span className="roadmap-title">{p.title}</span>
              <span className="roadmap-tags">
                {p.where.map((w) => {
                  const { icon: Icon, tone, label } = WHERE[w];
                  return (
                    <span key={w} className={`roadmap-where t-${tone}`} title={label}>
                      <Icon size={12} />
                    </span>
                  );
                })}
              </span>
              <span className="roadmap-min">{p.min ? `~${p.min} min` : 'ongoing'}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
