import { AlertTriangle, GraduationCap, Info, Lightbulb, OctagonAlert } from 'lucide-react';

const types = {
  note: { icon: Info, label: 'Note' },
  tip: { icon: Lightbulb, label: 'Tip' },
  important: { icon: OctagonAlert, label: 'Important' },
  warning: { icon: AlertTriangle, label: 'Warning' },
  exam: { icon: GraduationCap, label: 'Exam tip' },
};

export default function Callout({ type = 'note', title, children }) {
  const { icon: Icon, label } = types[type] ?? types.note;
  return (
    <aside className={`callout callout-${type}`}>
      <div className="callout-icon">
        <Icon size={16} />
      </div>
      <div className="callout-body">
        <p className="callout-title">{title ?? label}</p>
        {children}
      </div>
    </aside>
  );
}
