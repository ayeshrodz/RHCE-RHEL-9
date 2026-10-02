// Renders a compiled page's render tree. Only four node types exist (text, allowlisted
// elements, code as token data, catalog tags); anything else renders nothing. There is no
// path from content to raw HTML.
import { createElement, Fragment, useMemo } from 'react';
import { Anchor, Code } from '@/components/mdx/elements';
import { H2, H3 } from '@/components/mdx/Heading';
import Table from '@/components/mdx/Table';
import CodeBlock from '@/components/mdx/CodeBlock';
import { TeachingContentProvider } from '@/components/interactive/TeachingContent';
import { cleanProps, tags } from './registry';

/** Elements content may produce, and the engine component that renders each. */
const ELEMENTS = {
  p: 'p',
  h2: H2,
  h3: H3,
  h4: 'h4',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  blockquote: 'blockquote',
  strong: 'strong',
  em: 'em',
  del: 'del',
  code: Code,
  a: Anchor,
  br: 'br',
  hr: 'hr',
  table: Table,
  thead: 'thead',
  tbody: 'tbody',
  tr: 'tr',
  th: 'th',
  td: 'td',
};

/** Attributes an element may carry, already validated against the contract. */
const SAFE_URL = /^(?:#|lab\/|https:\/\/|mailto:)/;
function elementProps(tag, attrs = {}) {
  const props = {};
  if (attrs.id) props.id = attrs.id;
  if (attrs.href && SAFE_URL.test(attrs.href)) props.href = attrs.href;
  if (attrs.align && (tag === 'td' || tag === 'th')) props.align = attrs.align;
  if (Number.isInteger(attrs.start) && tag === 'ol') props.start = attrs.start;
  return props;
}

const THEME_STYLE = { '--shiki-light': '#24292e', '--shiki-dark': '#e1e4e8', '--shiki-light-bg': '#fff', '--shiki-dark-bg': '#24292e' };
const COLOR = /^#[0-9a-fA-F]{6}$/;

/** A highlighted block from token data: text spans with light and dark colours. */
function CodeNode({ node }) {
  const last = node.lines.length - 1;
  return (
    <CodeBlock
      className="shiki shiki-themes github-light github-dark"
      tabIndex={0}
      style={THEME_STYLE}
      data-title={node.title}
      data-lang={node.lang}
    >
      <code>
        {node.lines.map((line, i) => (
          <Fragment key={i}>
            <span className="line">
              {line.map((token, j) => (
                <span
                  key={j}
                  style={
                    token.l || token.d
                      ? {
                          ...(COLOR.test(token.l) ? { '--shiki-light': token.l } : {}),
                          ...(COLOR.test(token.d) ? { '--shiki-dark': token.d } : {}),
                        }
                      : undefined
                  }
                >
                  {token.v}
                </span>
              ))}
            </span>
            {i < last ? '\n' : null}
          </Fragment>
        ))}
      </code>
    </CodeBlock>
  );
}

function renderNodes(nodes, context) {
  return (nodes ?? []).map((node, i) => renderNode(node, i, context));
}

function renderNode(node, key, context) {
  switch (node?.t) {
    case 'text':
      return typeof node.v === 'string' ? node.v : null;
    case 'el': {
      const component = Object.hasOwn(ELEMENTS, node.tag) ? ELEMENTS[node.tag] : null;
      if (!component) return null;
      const children = node.c?.length ? renderNodes(node.c, context) : undefined;
      return createElement(component, { key, ...elementProps(node.tag, node.attrs) }, children);
    }
    case 'code':
      return <CodeNode key={key} node={node} />;
    case 'tag': {
      const entry = Object.hasOwn(tags, node.name) ? tags[node.name] : null;
      const attrs = node.attrs ?? {};
      const data = attrs.ref !== undefined ? context.data[attrs.ref] : undefined;
      if (!entry || (attrs.ref !== undefined && data === undefined)) return null;
      const [component, props] = entry(attrs, data, context);
      if (!component) return null;
      const children = node.c?.length ? renderNodes(node.c, context) : undefined;
      return createElement(component, { key, ...cleanProps(props) }, children);
    }
    default:
      return null;
  }
}

/** Copy for the page's legacy widgets, keyed by widget name, as the widgets expect it. */
function widgetCopy(page) {
  const copy = {};
  (function visit(nodes) {
    for (const node of nodes ?? []) {
      if (node.t === 'tag' && node.name === 'legacy-widget') {
        const entry = page.data[node.attrs.ref] ?? {};
        Object.assign(copy, entry.dependencies ?? {});
        if (entry.text || entry.data) copy[node.attrs.name] = { text: entry.text ?? {}, data: entry.data ?? {} };
      }
      visit(node.c);
    }
  })(page.tree);
  return copy;
}

/** One compiled page, rendered through the engine's components. */
export default function PageTree({ page, chapterId }) {
  const context = useMemo(() => ({ data: page.data, chapterId }), [page, chapterId]);
  const copy = useMemo(() => widgetCopy(page), [page]);
  const content = useMemo(() => renderNodes(page.tree, context), [page, context]);
  return <TeachingContentProvider content={copy}>{content}</TeachingContentProvider>;
}
