// Illustrations for the program cards on the home page. Each is original artwork in the diagram
// palette; a program picks one by name in its program.yml.

/** Automation: a playbook of three tasks fans out to three hosts, which light up in turn. */
function Automation() {
  return (
    <svg className="pa" viewBox="0 0 400 200" role="img" aria-label="A playbook with three tasks applied to three hosts">
      <rect className="pa-sheet" x="26" y="28" width="150" height="144" rx="14" />
      <rect x="26" y="28" width="150" height="30" rx="14" className="pa-sheet-top" />
      <text x="44" y="48" fontSize="12" fontFamily="var(--font-mono)" className="pa-title">
        site.yml
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i} className="pa-task" style={{ '--i': i }}>
          <rect x="42" y={74 + i * 32} width="18" height="18" rx="5" className="pa-box" />
          <path d={`M46 ${83 + i * 32}l4 4 7-8`} className="pa-tick" pathLength="1" />
          <rect x="70" y={78 + i * 32} width={84 - i * 14} height="10" rx="5" className="pa-bar" />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path className="pa-wire" style={{ '--i': i }} d={`M176 100 C 214 100, 222 ${46 + i * 54}, 262 ${46 + i * 54}`} fill="none" />
          <g className="pa-host" style={{ '--i': i }} transform={`translate(262 ${26 + i * 54})`}>
            <rect width="112" height="40" rx="10" className="pa-host-box" />
            <circle cx="22" cy="20" r="6" className="pa-led" />
            <rect x="38" y="15" width="56" height="10" rx="5" className="pa-bar" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** Terminal: a shell session beside three tiles for the areas an administrator looks after. */
function Terminal() {
  return (
    <svg className="pa" viewBox="0 0 400 200" role="img" aria-label="A shell session next to icons for security, storage and networking">
      <rect className="pa-sheet" x="26" y="28" width="216" height="144" rx="14" />
      <path d="M26 42a14 14 0 0 1 14-14h188a14 14 0 0 1 14 14v16H26z" className="pa-sheet-top" />
      <circle cx="44" cy="43" r="4.5" fill="var(--coral-200)" />
      <circle cx="60" cy="43" r="4.5" fill="var(--amber-200)" />
      <circle cx="76" cy="43" r="4.5" fill="var(--green-200)" />
      <g fontFamily="var(--font-mono)" fontSize="12">
        <text x="42" y="86" className="pa-line" style={{ '--i': 0 }}>
          <tspan fill="var(--teal-400)">$</tspan> systemctl status sshd
        </text>
        <text x="42" y="108" className="pa-line pa-dim" style={{ '--i': 1 }}>
          ● sshd.service - OpenSSH
        </text>
        <text x="42" y="128" className="pa-line" style={{ '--i': 2 }}>
          <tspan fill="var(--green-400)">Active: active (running)</tspan>
        </text>
        <text x="42" y="154" className="pa-line" style={{ '--i': 3 }}>
          <tspan fill="var(--teal-400)">$</tspan>
        </text>
        <rect className="pa-cursor" x="56" y="143" width="7" height="14" rx="1.5" />
      </g>
      {/* three tiles: lock, disk, network */}
      <g transform="translate(268 28)">
        <g className="pa-tile" style={{ '--i': 0 }}>
          <rect width="106" height="42" rx="11" className="pa-host-box" />
          <rect x="16" y="17" width="16" height="13" rx="3" className="pa-icon-fill" />
          <path d="M19 17v-4a5 5 0 0 1 10 0v4" className="pa-icon-stroke" />
          <rect x="42" y="16" width="48" height="10" rx="5" className="pa-bar" />
        </g>
      </g>
      <g transform="translate(268 79)">
        <g className="pa-tile" style={{ '--i': 1 }}>
          <rect width="106" height="42" rx="11" className="pa-host-box" />
          <ellipse cx="24" cy="15" rx="10" ry="4" className="pa-icon-fill" />
          <path d="M14 15v12c0 2.2 4.5 4 10 4s10-1.8 10-4V15" className="pa-icon-stroke" />
          <rect x="42" y="16" width="40" height="10" rx="5" className="pa-bar" />
        </g>
      </g>
      <g transform="translate(268 130)">
        <g className="pa-tile" style={{ '--i': 2 }}>
          <rect width="106" height="42" rx="11" className="pa-host-box" />
          <circle cx="24" cy="12" r="4.5" className="pa-icon-fill" />
          <circle cx="14" cy="30" r="4.5" className="pa-icon-fill" />
          <circle cx="34" cy="30" r="4.5" className="pa-icon-fill" />
          <path d="M22 16l-6 10M26 16l6 10M18.5 30h11" className="pa-icon-stroke" />
          <rect x="46" y="16" width="44" height="10" rx="5" className="pa-bar" />
        </g>
      </g>
    </svg>
  );
}

export default function ProgramArt({ name }) {
  return name === 'terminal' ? <Terminal /> : <Automation />;
}
