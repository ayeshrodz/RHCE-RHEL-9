import { useState } from 'react';
import ProjectTree from '../ch03/ProjectTree';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('RoleAnatomy', (copy) => {
  const FILES = copy.data.files;

  function RoleAnatomy() {
    const [sel, setSel] = useState(copy.data.initialSelection1);
    const f = FILES[sel];
    return (
      <div className="widget ra">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="ra-grid">
          <ProjectTree root="roles/web_site" paths={Object.keys(FILES)} onSelect={setSel} selected={sel} />
          <div className="ra-detail" aria-live="polite">
            <p className="ra-path">{sel}</p>
            <p className="ra-what">{f.what}</p>
            <pre className="terminal">{f.code}</pre>
          </div>
        </div>
      </div>
    );
  }
  return RoleAnatomy;
});
