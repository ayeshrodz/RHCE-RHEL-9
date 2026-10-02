import fs from 'node:fs';
import path from 'node:path';

/** Discover exports at build time; load a chapter's widgets only when rendered. */
export default function chapterWidgets() {
  const virtualId = 'virtual:chapter-widgets';
  let root;
  return {
    name: 'chapter-widgets',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === virtualId) return '\0' + virtualId;
    },
    load(id) {
      if (id !== '\0' + virtualId) return;
      const entries = [];
      const seen = new Set();
      for (const chapter of fs.readdirSync(path.join(root, 'src/diagrams')).filter((name) => /^ch\d+$/.test(name))) {
        const index = path.join(root, 'src/diagrams', chapter, 'index.js');
        this.addWatchFile(index);
        const source = fs.readFileSync(index, 'utf8');
        for (const match of source.matchAll(/export\s*\{\s*default as (\w+)\s*\}/g)) {
          const name = match[1];
          if (seen.has(name)) throw new Error(`Duplicate chapter widget: ${name}`);
          seen.add(name);
          entries.push(`${name}: lazyWidget(() => import('/src/diagrams/${chapter}/index.js').then(m => ({default:m.${name}})))`);
        }
      }
      return `import {lazyWidget} from '/src/components/interactive/LazyWidget.jsx';\nexport default {${entries.join(',\n')}};`;
    },
  };
}
