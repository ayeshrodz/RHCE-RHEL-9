/** The Kernel Path mark: a path that climbs from a starting point to a goal. */
export default function Logo({ size = 26 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M9 23l5-6 4.5 3L23.5 10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="23" r="2.2" fill="#fff" />
      <circle cx="23.5" cy="10" r="2.6" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
