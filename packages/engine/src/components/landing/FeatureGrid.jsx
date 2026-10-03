import {
  BookOpen,
  CircleCheck,
  Eye,
  FlaskConical,
  GitBranch,
  Laptop,
  Layers,
  RotateCcw,
  Save,
  ShieldCheck,
  SquareTerminal,
  Gauge,
} from 'lucide-react';
import { useInView } from './useInView';

const ICONS = {
  book: BookOpen,
  flask: FlaskConical,
  chart: Gauge,
  shield: ShieldCheck,
  layers: Layers,
  terminal: SquareTerminal,
  rotate: RotateCcw,
  save: Save,
  laptop: Laptop,
  eye: Eye,
  check: CircleCheck,
  git: GitBranch,
};
const TONES = ['purple', 'teal', 'coral', 'blue', 'amber', 'green', 'pink', 'gray'];

/** Short feature descriptions with an icon each, rising into place as the grid scrolls into view. */
export default function FeatureGrid({ items }) {
  const [ref, seen] = useInView(0.15);
  return (
    <ul ref={ref} className={`fg ${seen ? 'is-in' : ''}`}>
      {items.map((item, i) => {
        const Icon = ICONS[item.icon] ?? BookOpen;
        const tone = item.tone ?? TONES[i % TONES.length];
        return (
          <li key={item.title} className={`fg-item fg-${tone}`} style={{ '--i': i }}>
            <span className="fg-icon">
              <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h3 className="fg-title">{item.title}</h3>
            <p className="fg-text">{item.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
