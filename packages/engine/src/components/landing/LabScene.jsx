// The hero illustration: a terminal on the left, four servers on the right, and packets travelling
// between them. Original artwork, drawn here as inline SVG; every colour comes from theme tokens.
const SERVERS = [
  { y: 36, name: 'servera' },
  { y: 118, name: 'serverb' },
  { y: 200, name: 'serverc' },
  { y: 282, name: 'serverd' },
];

/** A curve from the terminal's edge to a server's. */
const route = (y) => `M 262 190 C 330 190, 340 ${y + 30}, 400 ${y + 30}`;

export default function LabScene() {
  return (
    <svg className="ls" viewBox="0 0 560 360" role="img" aria-label="A terminal sending commands to four servers on a private lab network">
      <defs>
        <linearGradient id="ls-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--purple-100)" />
          <stop offset="1" stopColor="var(--teal-100)" />
        </linearGradient>
      </defs>

      <g className="ls-bg" aria-hidden="true">
        <circle className="ls-blob ls-blob-a" cx="120" cy="80" r="92" fill="var(--purple-100)" />
        <circle className="ls-blob ls-blob-b" cx="470" cy="300" r="84" fill="var(--teal-100)" />
        <circle className="ls-blob ls-blob-c" cx="470" cy="40" r="52" fill="var(--coral-100)" />
        <rect
          x="14"
          y="14"
          width="532"
          height="332"
          rx="22"
          fill="none"
          stroke="var(--border)"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
      </g>

      <g aria-hidden="true">
        {SERVERS.map((s, i) => (
          <path key={s.name} className="ls-wire" style={{ '--i': i }} d={route(s.y)} fill="none" />
        ))}
        {SERVERS.map((s, i) => (
          <circle key={s.name} className="ls-packet" style={{ '--i': i, offsetPath: `path("${route(s.y)}")` }} r="5" />
        ))}
      </g>

      <g className="ls-terminal">
        <rect x="26" y="96" width="236" height="188" rx="14" className="ls-window" />
        <path d="M26 110a14 14 0 0 1 14-14h208a14 14 0 0 1 14 14v18H26z" className="ls-titlebar" />
        <circle cx="46" cy="112" r="5" fill="var(--coral-200)" />
        <circle cx="64" cy="112" r="5" fill="var(--amber-200)" />
        <circle cx="82" cy="112" r="5" fill="var(--green-200)" />
        <g className="ls-code" fontFamily="var(--font-mono)" fontSize="12.5">
          <text x="42" y="156" className="ls-line" style={{ '--i': 0 }}>
            <tspan fill="var(--teal-400)">$</tspan> lab start first-play
          </text>
          <text x="42" y="180" className="ls-line ls-muted" style={{ '--i': 1 }}>
            PLAY [all servers] ****
          </text>
          <text x="42" y="204" className="ls-line" style={{ '--i': 2 }}>
            <tspan fill="var(--green-400)">ok</tspan> servera
          </text>
          <text x="42" y="228" className="ls-line" style={{ '--i': 3 }}>
            <tspan fill="var(--amber-400)">changed</tspan> serverb
          </text>
          <text x="42" y="252" className="ls-line" style={{ '--i': 4 }}>
            <tspan fill="var(--teal-400)">$</tspan>
          </text>
          <rect className="ls-cursor" x="56" y="241" width="8" height="15" rx="1.5" />
        </g>
      </g>

      {SERVERS.map((s, i) => (
        <g key={s.name} className="ls-server" style={{ '--i': i }} transform={`translate(400 ${s.y})`}>
          <rect width="132" height="60" rx="12" className="ls-rack" />
          <rect x="12" y="14" width="72" height="8" rx="4" className="ls-bar" />
          <rect x="12" y="30" width="48" height="8" rx="4" className="ls-bar ls-bar-short" />
          <circle className="ls-led ls-led-a" cx="108" cy="18" r="4.5" />
          <circle className="ls-led ls-led-b" cx="108" cy="34" r="4.5" />
          <text x="12" y="53" fontSize="9.5" fontFamily="var(--font-mono)" className="ls-name">
            {s.name}
          </text>
        </g>
      ))}

      <g className="ls-badge ls-badge-a" aria-hidden="true">
        <rect x="170" y="36" width="138" height="30" rx="15" />
        <circle cx="188" cy="51" r="5" fill="var(--green-400)" />
        <text x="200" y="55" fontSize="11.5">
          SELinux enforcing
        </text>
      </g>
      <g className="ls-badge ls-badge-b" aria-hidden="true">
        <rect x="30" y="306" width="148" height="30" rx="15" />
        <path d="M46 321l5 5 9-10" fill="none" stroke="var(--teal-400)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="68" y="325" fontSize="11.5">
          snapshot: clean
        </text>
      </g>
      <g className="ls-badge ls-badge-c" aria-hidden="true">
        <rect x="226" y="306" width="140" height="30" rx="15" />
        <circle cx="244" cy="321" r="5" fill="var(--purple-400)" />
        <text x="256" y="325" fontSize="11.5">
          graded: 12 / 12
        </text>
      </g>
    </svg>
  );
}
