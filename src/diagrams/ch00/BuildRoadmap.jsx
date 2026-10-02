import { Link } from 'react-router-dom';
import { Globe, Monitor, Server, SquareTerminal } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('BuildRoadmap', (copy) => {
  const WHERE = {
    host: { icon: SquareTerminal, label: 'Host', tone: 'purple' },
    ui: { icon: Globe, label: copy.text.label, tone: 'blue' },
    vm: { icon: Server, label: 'VM', tone: 'green' },
    you: { icon: Monitor, label: copy.text.label2, tone: 'gray' },
  };

  const PHASES = copy.data.phases;

  function BuildRoadmap() {
    const total = PHASES.reduce((s, p) => s + p.min, 0);
    return (
      <div className="widget roadmap">
        <div className="roadmap-head">
          <p className="widget-title">{copy.text.widgetTitle}</p>
          <span className="pill">
            {copy.text.pill}
            {Math.round(total / 5) * 5}
            {copy.text.pill2}
          </span>
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
                <span className="roadmap-min">{p.min ? formatCopy(copy.text.template, [p.min]) : 'ongoing'}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return BuildRoadmap;
});
