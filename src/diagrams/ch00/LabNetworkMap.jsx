import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Arrow, Diagram, Group, Node } from '../kit';
import { usePlaceholderValues } from '@/lib/placeholders';

// Each flow: which arrows to draw, the verdict, and the nftables rule responsible.
const FLOWS = [
  {
    id: 'vm-vm',
    label: 'VM ↔ VM',
    ok: true,
    text: 'Machines inside the lab talk freely: SSH, ping, HTTP, anything. This is how Ansible on workstation reaches the servers.',
    rule: 'chain forward:  iifname "rhcebr0" oifname "rhcebr0" accept',
    arrows: [
      {
        points: [
          [466, 150],
          [456, 150],
          [456, 190],
          [464, 190],
        ],
        variant: 'ok',
        both: true,
        label: 'ssh',
        labelAt: 0.5,
        labelDx: -14,
        labelDy: 4,
      },
    ],
    nodes: ['ws', 'sa'],
  },
  {
    id: 'vm-internet',
    label: 'VM → internet',
    ok: true,
    text: 'VMs reach the internet through the gateway, which translates their addresses (NAT) and sends the traffic out of the host’s LAN interface. This is what makes dnf install work.',
    rule: 'chain forward:  everything else from the lab is allowed (after the private-range drop)',
    arrows: [
      {
        points: [
          [450, 298],
          [412, 298],
        ],
        variant: 'ok',
      },
      {
        points: [
          [272, 258],
          [272, 240],
        ],
        variant: 'ok',
      },
      {
        points: [
          [272, 188],
          [272, 170],
        ],
        variant: 'ok',
        label: 'NAT',
        labelAnchor: 'end',
        labelDx: -8,
        labelDy: 4,
      },
      {
        points: [
          [210, 128],
          [158, 128],
        ],
        variant: 'ok',
      },
      {
        points: [
          [140, 114],
          [140, 58],
        ],
        variant: 'ok',
      },
    ],
    nodes: ['sa', 'gw', 'seal', 'nic', 'router', 'net'],
  },
  {
    id: 'lxc',
    label: 'You → VM (lxc exec)',
    ok: true,
    text: 'lxc exec and the LXD UI Terminal tab reach VMs through the lxd-agent console channel, not the network, so the firewall never sees them. This is how you get in.',
    rule: 'no rule involved: not network traffic',
    arrows: [
      {
        points: [
          [410, 360],
          [440, 360],
          [440, 138],
          [464, 138],
        ],
        variant: 'ok',
        label: 'console channel',
        labelAt: 0.12,
      },
    ],
    nodes: ['lxc', 'ws'],
  },
  {
    id: 'dhcp',
    label: 'VM → DHCP / DNS',
    ok: true,
    text: 'VMs may ask the gateway for their IP address (DHCP) and look up names such as servera.lab.example.com (DNS). Nothing else on the host is open to them.',
    rule: 'chain input:  iifname "rhcebr0" udp dport { 53, 67 } accept',
    arrows: [
      {
        points: [
          [450, 290],
          [412, 290],
        ],
        variant: 'ok',
        label: '53 · 67',
        labelDy: -6,
      },
    ],
    nodes: ['sd', 'gw'],
  },
  {
    id: 'lan-lab',
    label: 'LAN device → lab',
    ok: false,
    text: 'A laptop on your network cannot open a connection into the lab. Your router has no route to 172.25.250.0/24 anyway, and even if it did, the host drops it.',
    rule: 'chain forward:  oifname "rhcebr0" drop   # anything new INTO the lab',
    arrows: [
      {
        points: [
          [158, 214],
          [182, 214],
          [182, 150],
          [208, 150],
        ],
        hot: true,
      },
      {
        points: [
          [300, 168],
          [300, 186],
        ],
        variant: 'bad',
      },
    ],
    nodes: ['laptop', 'nic', 'seal'],
  },
  {
    id: 'host-lab',
    label: 'Host → lab',
    ok: false,
    text: 'Even the host itself cannot ssh or ping the VMs. It only hands out addresses and answers DNS. That is why you use lxc exec, which does not use the network.',
    rule: 'chain output:  oifname "rhcebr0" drop   # host can’t start connections',
    arrows: [
      {
        points: [
          [412, 274],
          [448, 274],
        ],
        variant: 'bad',
        label: 'ssh / ping',
        labelDy: -7,
      },
    ],
    nodes: ['gw'],
  },
  {
    id: 'lab-lan',
    label: 'Lab → your LAN',
    ok: false,
    text: 'VMs cannot reach devices on your local network, your router’s admin page, or VPN ranges. Everything private is dropped; only the public internet is allowed.',
    rule: 'chain forward:  iifname "rhcebr0" ip daddr { 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 100.64.0.0/10 } drop',
    arrows: [
      {
        points: [
          [450, 306],
          [412, 306],
        ],
        hot: true,
      },
      {
        points: [
          [250, 258],
          [250, 242],
        ],
        variant: 'bad',
      },
    ],
    nodes: ['sb', 'gw', 'seal'],
  },
  {
    id: 'lab-host',
    label: 'Lab → host services',
    ok: false,
    text: 'VMs cannot reach the host’s SSH, the LXD UI on :8443, or any other service on it. Only DHCP and DNS are answered.',
    rule: 'chain input:  iifname "rhcebr0" drop   # nothing else on the host',
    arrows: [
      {
        points: [
          [450, 282],
          [414, 282],
        ],
        variant: 'bad',
        label: ':22 :8443',
        labelDy: -6,
      },
    ],
    nodes: ['sc', 'gw'],
  },
];

const N = {
  net: { x: 10, y: 10, w: 150, h: 46, tone: 'blue', title: 'Internet' },
  router: { x: 20, y: 114, w: 138, h: 48, tone: 'gray', title: 'Router', sub: '<ROUTER_IP>' },
  laptop: { x: 20, y: 190, w: 138, h: 48, tone: 'gray', title: 'Laptops, phones' },
  nic: { x: 210, y: 116, w: 200, h: 52, tone: 'purple', title: 'LAN interface', sub: '<HOST_LAN_IP>' },
  seal: { x: 210, y: 188, w: 200, h: 52, tone: 'red', title: 'nftables seal', sub: 'table inet rhce_isolate' },
  gw: {
    x: 210,
    y: 258,
    w: 200,
    h: 58,
    tone: 'teal',
    title: 'rhcebr0 · 172.25.250.254',
    sub: 'gateway · DHCP · DNS · NAT',
    titleSize: 12.5,
  },
  lxc: { x: 210, y: 336, w: 200, h: 50, tone: 'amber', title: 'lxc exec / LXD UI', sub: 'lxd-agent console channel' },
  ws: { x: 466, y: 116, w: 192, h: 42, tone: 'green', title: 'workstation  .9', mono: true },
  sa: { x: 466, y: 168, w: 94, h: 42, tone: 'green', title: 'servera', sub: '.10' },
  sb: { x: 564, y: 168, w: 94, h: 42, tone: 'green', title: 'serverb', sub: '.11' },
  sc: { x: 466, y: 218, w: 94, h: 42, tone: 'green', title: 'serverc', sub: '.12' },
  sd: { x: 564, y: 218, w: 94, h: 42, tone: 'green', title: 'serverd', sub: '.13' },
  ut: { x: 466, y: 268, w: 192, h: 42, tone: 'gray', title: 'utility  .8', sub: 'optional', mono: true },
};

/** The sealed lab network. Pick a traffic flow to see its path and the rule that allows or blocks it. */
export default function LabNetworkMap() {
  const [sel, setSel] = useState('vm-internet');
  const flow = FLOWS.find((f) => f.id === sel);
  const [values] = usePlaceholderValues();
  // Show the reader's own addresses in the diagram once they have filled them in.
  const fill = (text) => (typeof text === 'string' ? text.replace(/<(\w+)>/g, (m, k) => values[k]?.trim() || m) : text);

  const panel = (
    <div className="lnm-panel">
      <div className="lnm-flows" role="radiogroup" aria-label="Traffic flow">
        {[true, false].map((ok) => (
          <div key={String(ok)} className="lnm-flow-group">
            <span className={`lnm-flow-head ${ok ? 'is-ok' : 'is-bad'}`}>{ok ? 'Allowed' : 'Blocked'}</span>
            {FLOWS.filter((f) => f.ok === ok).map((f) => (
              <button
                key={f.id}
                role="radio"
                aria-checked={f.id === sel}
                className={`chip ${f.id === sel ? 'is-active' : ''} ${ok ? 't-green' : 't-red'}`}
                onClick={() => setSel(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={`lnm-verdict ${flow.ok ? 'is-ok' : 'is-bad'}`} aria-live="polite">
        <p className="lnm-verdict-title">
          {flow.ok ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />} {flow.label}: {flow.ok ? 'allowed' : 'blocked'}
        </p>
        <p className="lnm-verdict-text">{flow.text}</p>
        <code className="lnm-rule">{flow.rule}</code>
      </div>
    </div>
  );

  return (
    <Diagram
      height={400}
      title="The sealed lab network"
      caption="Traffic may leave the lab for the internet, and flows freely between VMs. Nothing may start a connection into the lab, not even the host."
      below={panel}
    >
      <Group x={8} y={86} w={162} h={166} tone="gray" label="Local network" />
      <Group x={196} y={86} w={228} h={308} tone="purple" label="Ubuntu host" />
      <Group x={452} y={86} w={220} h={236} tone="green" label="Sealed lab" sub="172.25.250.0/24" active />

      {/* Static wiring */}
      <Arrow
        points={[
          [140, 58],
          [140, 112],
        ]}
        both
        dim={!!flow}
      />
      <Arrow
        points={[
          [158, 138],
          [208, 138],
        ]}
        both
        dim={!!flow}
      />
      <Arrow
        points={[
          [310, 168],
          [310, 186],
        ]}
        both
        dim={!!flow}
      />
      <Arrow
        points={[
          [310, 240],
          [310, 256],
        ]}
        both
        dim={!!flow}
      />
      <Arrow
        points={[
          [410, 314],
          [440, 314],
          [450, 314],
        ]}
        both
        dim={!!flow}
      />

      {Object.entries(N).map(([k, n]) => (
        <Node key={k} {...n} sub={fill(n.sub)} dim={!flow.nodes.includes(k) && k !== 'ut'} active={flow.nodes.includes(k)} />
      ))}

      {flow.arrows.map((a, i) => (
        <Arrow key={`${sel}-${i}`} {...a} />
      ))}
    </Diagram>
  );
}
