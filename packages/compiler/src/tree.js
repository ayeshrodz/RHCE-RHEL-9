// Reads a Markdoc page and its data file, and converts them into the contract's render tree:
// text, allowlisted elements, highlighted code as data, and catalog tags whose structured
// data lives in the page's data file under the tag's `ref`.
//
// Markdoc runs as a parser only. Variables, functions and annotations are refused, and
// code blocks are never scanned for tags, so Jinja and similar syntax stays plain text.
import Markdoc from '@markdoc/markdoc';
import YAML from 'yaml';
import GithubSlugger from 'github-slugger';
import { catalog } from '@kernel-path/schema';
import { tokenize } from './highlight.js';

const tokenizer = new Markdoc.Tokenizer({ allowIndentation: true });
const lineOf = (node) => (node.lines?.length ? node.lines[0] + 1 : undefined);
const plain = (node) =>
  node.type === 'text' || node.type === 'code' ? node.attributes.content : (node.children ?? []).map(plain).join('');

/** Attributes each Markdown node carries natively; anything else came from an annotation. */
const NATIVE = {
  document: ['frontmatter'],
  paragraph: [],
  inline: [],
  text: ['content'],
  heading: ['level'],
  strong: ['marker'],
  em: ['marker'],
  s: ['marker'],
  code: ['content'],
  hardbreak: [],
  softbreak: [],
  hr: [],
  blockquote: [],
  link: ['href', 'title'],
  list: ['ordered', 'start', 'marker'],
  item: [],
  table: [],
  thead: [],
  tbody: [],
  tr: [],
  th: ['align'],
  td: ['align'],
  fence: ['content', 'language', 'title'],
};

/** Parse a page's Markdoc source and optional YAML data. Returns { front, ast, data }. */
export function readPage(source, dataSource, file, dataFile, diagnostics) {
  const tokens = tokenizer.tokenize(source);
  // Code is literal: never look for tags inside fenced blocks.
  for (const token of tokens) if (token.type === 'fence') token.children = null;
  const ast = Markdoc.parse(tokens);
  let front = {};
  try {
    front = YAML.parse(ast.attributes.frontmatter ?? '') ?? {};
  } catch (e) {
    diagnostics.error(file, 1, `invalid frontmatter: ${e.message}`);
  }
  let data = {};
  if (dataSource != null) {
    try {
      data = YAML.parse(dataSource) ?? {};
      if (typeof data !== 'object' || Array.isArray(data)) throw new Error('expected a map of ref: data');
    } catch (e) {
      diagnostics.error(dataFile, null, `invalid page data: ${e.message}`);
      data = {};
    }
  }
  return { front, ast, data };
}

/**
 * Convert one page read by readPage. Returns the render tree, the page data (keyed by tag
 * refs, every entry checked against its tag's data schema) and the table of contents.
 */
export function convertPage(page, { file, dataFile, diagnostics, validator }) {
  const slugger = new GithubSlugger();
  const { data } = page;
  const toc = [];
  const usedRefs = new Set();

  const fail = (node, message) => diagnostics.error(file, lineOf(node), message);
  const el = (tag, c, attrs) => ({ t: 'el', tag, ...(attrs ? { attrs } : {}), ...(c?.length ? { c } : {}) });

  /** Convert a list of nodes, merging neighbouring text (Markdoc splits text at line breaks). */
  function many(nodes, parent) {
    const out = [];
    for (const n of nodes.flatMap((node) => convert(node, parent))) {
      const last = out.at(-1);
      if (n.t === 'text' && last?.t === 'text') out[out.length - 1] = { t: 'text', v: last.v + n.v };
      else out.push(n);
    }
    return out;
  }

  function convert(node, parent) {
    for (const error of node.errors ?? []) fail(node, error.message);
    if (node.type === 'tag') return component(node, parent);
    const native = NATIVE[node.type];
    if (!native) {
      fail(node, node.type === 'error' ? 'invalid tag syntax' : `unsupported Markdown element '${node.type}'`);
      return [];
    }
    for (const key of Object.keys(node.attributes)) if (!native.includes(key)) fail(node, `annotation '${key}' is not allowed here`);
    const a = node.attributes;
    const kids = () => many(node.children, parent);
    switch (node.type) {
      case 'document':
      case 'inline':
        return kids();
      case 'text':
        return [{ t: 'text', v: a.content }];
      case 'softbreak':
        return [{ t: 'text', v: '\n' }];
      case 'paragraph': {
        // A paragraph holding only tags (and whitespace) is not a paragraph of text.
        const inline = node.children.flatMap((c) => (c.type === 'inline' ? c.children : [c]));
        const onlyTags =
          inline.some((c) => c.type === 'tag') &&
          inline.every((c) => c.type === 'tag' || (c.type === 'text' && !c.attributes.content.trim()) || c.type === 'softbreak');
        return onlyTags ? kids() : [el('p', kids())];
      }
      case 'heading': {
        if (a.level < 2 || a.level > 4) {
          fail(node, 'use ## to #### headings; the page title comes from the frontmatter');
          return [];
        }
        const text = plain(node);
        const id = slugger.slug(text);
        if (a.level <= 3) toc.push({ id, text, depth: a.level });
        return [el(`h${a.level}`, kids(), { id })];
      }
      case 'strong':
        return [el('strong', kids())];
      case 'em':
        return [el('em', kids())];
      case 's':
        return [el('del', kids())];
      case 'code':
        return [el('code', [{ t: 'text', v: a.content }])];
      case 'hardbreak':
        return [el('br')];
      case 'hr':
        return [el('hr')];
      case 'blockquote':
        return [el('blockquote', kids())];
      case 'link': {
        if (validator.checkFormat('url', a.href).length)
          fail(node, `link '${a.href}' is not allowed: use #/..., #anchor, lab/..., https:// or mailto:`);
        return [el('a', kids(), { href: a.href })];
      }
      case 'list': {
        const attrs = a.ordered && a.start != null && a.start !== 1 ? { start: a.start } : undefined;
        return [el(a.ordered ? 'ol' : 'ul', kids(), attrs)];
      }
      case 'item':
        return [el('li', kids())];
      case 'table': {
        const sections = node.children.map((section) => [section.type, many(section.children, parent)]);
        return [
          el(
            'table',
            sections.filter(([, rows]) => rows.length).map(([tag, rows]) => el(tag, rows)),
          ),
        ];
      }
      case 'thead':
      case 'tbody':
        return kids();
      case 'tr':
        return [el('tr', kids())];
      case 'th':
      case 'td':
        return [el(node.type, kids(), a.align ? { align: a.align } : undefined)];
      case 'fence':
        return [
          {
            t: 'code',
            lang: a.language || 'text',
            ...(a.title ? { title: a.title } : {}),
            lines: tokenize(a.content.replace(/\n$/, ''), a.language),
          },
        ];
    }
    return [];
  }

  function component(node, parent) {
    const name = node.tag;
    const attrs = {};
    for (const [key, value] of Object.entries(node.attributes)) {
      if (Markdoc.Ast.isAst(value)) fail(node, `'${name}' attribute '${key}': variables and functions are not allowed`);
      else attrs[key] = value;
    }
    let c = many(node.children, name);
    // Tag-only containers lift tags out of the paragraph Markdoc wraps one-line tags in.
    const spec = catalog.components[name];
    if (spec?.children === 'tags') c = c.flatMap((n) => (n.t === 'el' && n.tag === 'p' ? (n.c ?? []) : [n]));
    for (const problem of validator.checkTag(name, attrs, c, parent)) fail(node, problem);
    if (attrs.ref !== undefined) {
      if (usedRefs.has(attrs.ref)) fail(node, `the data '${attrs.ref}' is already used by another tag`);
      usedRefs.add(attrs.ref);
      if (!Object.hasOwn(data, attrs.ref)) fail(node, `'${name}' refers to '${attrs.ref}', which is not in the page data file`);
      else for (const problem of validator.checkData(name, data[attrs.ref])) fail(node, `${name} data ${problem}`);
    }
    const kept = spec?.children === 'tags' ? c.filter((n) => !(n.t === 'text' && !n.v.trim())) : c;
    return [{ t: 'tag', name, ...(Object.keys(attrs).length ? { attrs } : {}), ...(kept.length ? { c: kept } : {}) }];
  }

  const tree = many([page.ast], 'page');
  for (const ref of Object.keys(data))
    if (!usedRefs.has(ref)) diagnostics.error(dataFile, null, `'${ref}' is not used by any tag on the page`);
  return { tree, data, toc };
}
