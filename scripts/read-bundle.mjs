// Shared build/test reader: compiles content/ in memory and exposes the program's manifest,
// compiled pages and practice questions. The compiler is the only content parser.
import { compile } from '@kernel-path/compiler';

/** Visit every node of a render tree depth-first, with its parent tag name. */
export function walk(nodes, visit, parent = 'page') {
  for (const node of nodes ?? []) {
    visit(node, parent);
    walk(node.c, visit, node.t === 'tag' ? node.name : parent);
  }
}

/** Plain text of render-tree nodes. */
export const textOf = (nodes) =>
  (nodes ?? []).map((n) => (n.t === 'text' ? n.v : n.t === 'code' ? n.lines.flat().map((t) => t.v).join('') : textOf(n.c))).join('');

export async function readBundle(dir = 'content') {
  const { files } = await compile(dir);
  const json = (file) => JSON.parse(files.get(file));
  const site = json('site.json');
  const manifest = json(site.programs[0].manifest);
  const pages = Object.fromEntries(Object.entries(manifest.pages).map(([key, file]) => [key, json(file)]));
  const legacy = manifest.legacy ? json(manifest.legacy) : null;
  const practice = [];
  for (const chapter of manifest.chapters)
    for (const section of chapter.sections) {
      const page = pages[`${chapter.id}/${section.slug}`];
      walk(page.tree, (node) => {
        if (node.t === 'tag' && node.name === 'practice')
          practice.push(...page.data[node.attrs.ref].questions.map((q) => ({ ...q, chapter: chapter.id })));
      });
    }
  return { site, manifest, pages, legacy, practice };
}
