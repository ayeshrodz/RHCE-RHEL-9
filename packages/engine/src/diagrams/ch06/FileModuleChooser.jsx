import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, Laptop, Pencil, Server } from 'lucide-react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('FileModuleChooser', (copy) => {
  const GOALS = copy.data.goals;

  const DIRS = {
    push: { icon: ArrowRight, text: copy.text.text, tone: 'push' },
    pull: { icon: ArrowLeft, text: copy.text.text2, tone: 'pull' },
    edit: { icon: Pencil, text: copy.text.text3, tone: 'edit' },
    read: { icon: Eye, text: copy.text.text4, tone: 'read' },
  };

  function FileModuleChooser() {
    const [id, setId] = useState(copy.data.initialSelection1);
    const g = GOALS.find((x) => x.id === id);
    const d = DIRS[g.dir];
    const Icon = d.icon;

    return (
      <div className="widget fmc">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="fmc-grid">
          <ul className="fmc-goals" role="listbox" aria-label={copy.text.label}>
            {GOALS.map((x) => (
              <li key={x.id}>
                <button role="option" aria-selected={x.id === id} className={x.id === id ? 'is-active' : ''} onClick={() => setId(x.id)}>
                  {x.goal}
                </button>
              </li>
            ))}
          </ul>
          <div className="fmc-detail" aria-live="polite">
            <p className="fmc-module">{g.module}</p>
            <div className={`fmc-dir is-${d.tone}`}>
              <span className={g.dir === 'pull' ? 'is-target' : ''}>
                <Laptop size={14} />
                {copy.text.span}
              </span>
              <Icon size={16} className="fmc-arrow" />
              <span className={g.dir === 'pull' ? '' : 'is-target'}>
                <Server size={14} />
                {copy.text.span2}
              </span>
              <em>{d.text}</em>
            </div>
            <pre className="terminal fmc-yaml">{g.yaml}</pre>
            <p className="fmc-note">{g.note}</p>
          </div>
        </div>
      </div>
    );
  }
  return FileModuleChooser;
});
