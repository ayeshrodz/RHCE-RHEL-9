import { File, Folder, Lock } from 'lucide-react';

/**
 * Draw a project directory from a list of paths.
 * paths: ['ansible.cfg', 'group_vars/webservers/vars', ...] (a trailing / marks an empty directory)
 * locked: paths shown as Vault-encrypted; highlight / dim: paths to emphasise or fade;
 * notes: { path: 'short annotation' }; onSelect(path) makes files clickable.
 */
export default function ProjectTree({
  root = 'project',
  paths,
  locked = [],
  highlight = [],
  dim = [],
  notes = {},
  onSelect,
  selected,
  caption,
}) {
  const rows = buildRows(paths);
  return (
    <figure className="ptree-figure">
      <div className="ptree" role="tree" aria-label={`${root} directory`}>
        <div className="ptree-row is-root">
          <Folder size={14} /> <span>{root}/</span>
        </div>
        {rows.map((row) => {
          const isLocked = locked.includes(row.path);
          const Icon = row.dir ? Folder : isLocked ? Lock : File;
          const clickable = onSelect && !row.dir;
          const cls = [
            'ptree-row',
            row.dir ? 'is-dir' : 'is-file',
            isLocked ? 'is-locked' : '',
            highlight.includes(row.path) ? 'is-hot' : '',
            dim.includes(row.path) ? 'is-dim' : '',
            selected === row.path ? 'is-selected' : '',
            clickable ? 'is-clickable' : '',
          ].join(' ');
          const content = (
            <>
              <span className="ptree-guides">
                {row.guides.map((g, i) => (
                  <span key={i} className={`ptree-guide ${g}`} />
                ))}
              </span>
              <Icon size={14} className="ptree-icon" />
              <span className="ptree-name">
                {row.name}
                {row.dir ? '/' : ''}
              </span>
              {notes[row.path] && <span className="ptree-note">{notes[row.path]}</span>}
            </>
          );
          return clickable ? (
            <button key={row.path} className={cls} role="treeitem" onClick={() => onSelect(row.path)}>
              {content}
            </button>
          ) : (
            <div key={row.path} className={cls} role="treeitem">
              {content}
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="widget-caption">{caption}</figcaption>}
    </figure>
  );
}

function buildRows(paths) {
  const root = { children: new Map() };
  for (const p of paths) {
    const parts = p.replace(/\/$/, '').split('/');
    let node = root;
    parts.forEach((part, i) => {
      if (!node.children.has(part)) {
        const isLast = i === parts.length - 1;
        node.children.set(part, {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          dir: !isLast || p.endsWith('/'),
          children: new Map(),
        });
      }
      node = node.children.get(part);
      if (i < parts.length - 1) node.dir = true;
    });
  }
  const rows = [];
  const walk = (node, guides) => {
    const kids = [...node.children.values()];
    kids.forEach((kid, i) => {
      const last = i === kids.length - 1;
      rows.push({ ...kid, guides: [...guides, last ? 'is-elbow' : 'is-tee'] });
      walk(kid, [...guides, last ? 'is-blank' : 'is-line']);
    });
  };
  walk(root, []);
  return rows;
}
