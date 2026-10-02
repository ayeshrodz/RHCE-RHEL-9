// Converts a page's Markdown tree into the contract's render tree: text, allowlisted
// elements, highlighted code as data, and catalog tags with their data moved into page data.
import GithubSlugger from 'github-slugger';
import { catalog, mdxMigration } from '@kernel-path/schema';
import { tokenize } from './highlight.js';

const LEGACY = new Set(catalog.components['legacy-widget'].attributes.name.enum);
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const plain = (node) => (node.type === 'text' || node.type === 'inlineCode' ? node.value : (node.children ?? []).map(plain).join(''));

/** Page data for tags whose structured attributes move into the page's data file. */
function shapeData(rule, props) {
  switch (rule.dataShape) {
    case 'quiz':
      return { questions: props.questions };
    case 'practice':
      return { questions: (props.challenges ?? []).map(({ chapter, type, ...question }) => question) };
    case 'flashcards':
      return { cards: props.cards };
    case 'flow-map':
      return { steps: props.steps, ...(props.connections ? { connections: props.connections } : {}) };
    default:
      throw new Error(`unknown data shape ${rule.dataShape}`);
  }
}

/**
 * Convert one page. `page` is { tree, scope } from the MDX bridge. Returns the render
 * tree, the page data (keyed by tag refs) and the table of contents.
 */
export function convertPage(page, { file, diagnostics, validator }) {
  const slugger = new GithubSlugger();
  const data = {};
  const toc = [];
  const counts = new Map();
  const widgetContent = page.scope.widgetContent ?? {};
  const legacyData = [];
  const usedWidgets = new Set();

  const uniqueRef = (base) => {
    const n = (counts.get(base) ?? 0) + 1;
    counts.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  const fail = (node, message) => diagnostics.error(file, node, message);
  const many = (nodes, parent, options) => nodes.flatMap((n) => convert(n, parent, options));
  const el = (tag, c, attrs) => ({ t: 'el', tag, ...(attrs ? { attrs } : {}), ...(c?.length ? { c } : {}) });

  function convert(node, parent, options = {}) {
    switch (node.type) {
      case 'yaml':
      case 'mdxjsEsm':
        return [];
      case 'text':
        return [{ t: 'text', v: node.value }];
      case 'paragraph':
        return options.tight ? many(node.children, parent) : [el('p', many(node.children, parent))];
      case 'heading': {
        if (node.depth < 2 || node.depth > 4) {
          fail(node, 'use ## to #### headings; the page title comes from the frontmatter');
          return [];
        }
        const id = slugger.slug(plain(node));
        if (node.depth <= 3) toc.push({ id, text: plain(node), depth: node.depth });
        return [el(`h${node.depth}`, many(node.children, parent), { id })];
      }
      case 'strong':
        return [el('strong', many(node.children, parent))];
      case 'emphasis':
        return [el('em', many(node.children, parent))];
      case 'delete':
        return [el('del', many(node.children, parent))];
      case 'inlineCode':
        return [el('code', [{ t: 'text', v: node.value }])];
      case 'break':
        return [el('br')];
      case 'thematicBreak':
        return [el('hr')];
      case 'blockquote':
        return [el('blockquote', many(node.children, parent))];
      case 'link': {
        const problems = validator.checkFormat('url', node.url);
        if (problems.length) fail(node, `link '${node.url}' is not allowed: use #/..., #anchor, lab/..., https:// or mailto:`);
        return [el('a', many(node.children, parent), { href: node.url })];
      }
      case 'list': {
        const tight = !(node.spread || node.children.some((item) => item.spread));
        const attrs = node.ordered && node.start != null && node.start !== 1 ? { start: node.start } : undefined;
        const items = node.children.map((item) =>
          el('li', many(item.children, parent, { tight }), typeof item.checked === 'boolean' ? { checked: item.checked } : undefined),
        );
        return [el(node.ordered ? 'ol' : 'ul', items, attrs)];
      }
      case 'table': {
        const rows = node.children.map((row, r) =>
          el(
            'tr',
            row.children.map((cell, i) =>
              el(r === 0 ? 'th' : 'td', many(cell.children, parent), node.align?.[i] ? { align: node.align[i] } : undefined),
            ),
          ),
        );
        return [el('table', [el('thead', rows.slice(0, 1)), ...(rows.length > 1 ? [el('tbody', rows.slice(1))] : [])])];
      }
      case 'code': {
        const title = node.meta?.match(/title="([^"]+)"/)?.[1];
        return [{ t: 'code', lang: node.lang ?? 'text', ...(title ? { title } : {}), lines: tokenize(node.value, node.lang) }];
      }
      case 'mdxJsxFlowElement':
      case 'mdxJsxTextElement':
        return component(node, parent);
      default:
        fail(node, `unsupported Markdown element '${node.type}'`);
        return [];
    }
  }

  function component(node, parent) {
    const rule = mdxMigration.components[node.name];
    const props = node.props ?? {};
    let name;
    let attrs = {};
    if (!rule) {
      if (!LEGACY.has(node.name)) {
        fail(node, `unknown component <${node.name}>`);
        return [];
      }
      name = 'legacy-widget';
      usedWidgets.add(node.name);
      const ref = uniqueRef(kebab(node.name));
      const copy = widgetContent[node.name];
      data[ref] = {
        ...(copy?.text ? { text: copy.text } : {}),
        ...(copy?.data ? { data: copy.data } : {}),
        ...(Object.keys(props).length ? { props } : {}),
      };
      legacyData.push(data[ref]);
      attrs = { name: node.name, ref };
    } else {
      name = rule.tag;
      const dropped = new Set([...(rule.dropAttributes ?? []), rule.dataAttribute, ...(rule.dataAttributes ?? [])]);
      for (const [key, value] of Object.entries(props)) {
        if (dropped.has(key)) continue;
        const target = rule.rename?.[key] ?? key;
        attrs[target] = rule.transform?.[target] === 'strip-lab-start' ? String(value).replace(/^lab start\s+/, '') : value;
      }
      Object.assign(attrs, rule.fixed ?? {});
      if (rule.dataShape) {
        const base = rule.tag === 'quiz' ? (props.id ?? 'quiz') : rule.dataShape;
        const ref = uniqueRef(base);
        data[ref] = shapeData(rule, props);
        attrs.ref = ref;
      }
    }
    let c = many(node.children ?? [], name);
    // MDX wraps tags written on one line in a paragraph; tag-only containers lift them out.
    if (catalog.components[name]?.children === 'tags') c = c.flatMap((n) => (n.t === 'el' && n.tag === 'p' ? (n.c ?? []) : [n]));
    for (const problem of validator.checkTag(name, attrs, c, parent)) fail(node, problem);
    if (attrs.ref) for (const problem of validator.checkData(name, data[attrs.ref])) fail(node, `${name} data ${problem}`);
    const kept = catalog.components[name]?.children === 'tags' ? c.filter((n) => !(n.t === 'text' && !n.v.trim())) : c;
    return [{ t: 'tag', name, ...(Object.keys(attrs).length ? { attrs } : {}), ...(kept.length ? { c: kept } : {}) }];
  }

  const tree = many(page.tree.children, 'page');

  // Copy for widgets that other widgets render inside themselves (for example DataExplorer).
  const dependencies = Object.fromEntries(
    Object.entries(widgetContent)
      .filter(([name]) => !usedWidgets.has(name))
      .map(([name, copy]) => [name, { ...(copy.text ? { text: copy.text } : {}), ...(copy.data ? { data: copy.data } : {}) }]),
  );
  if (Object.keys(dependencies).length) for (const entry of legacyData) entry.dependencies = dependencies;

  return { tree, data, toc };
}
