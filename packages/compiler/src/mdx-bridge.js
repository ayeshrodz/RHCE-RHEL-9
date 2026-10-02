// Reads pre-apiVersion-1 MDX pages as data. MDX allows JavaScript, so this bridge
// accepts only what the content contract can express: exported constants and JSX
// attributes that evaluate statically to JSON-like data. Anything else is an error.
// It is removed after the Markdoc migration (phase 4).
import YAML from 'yaml';
import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';

const parser = createProcessor({ remarkPlugins: [remarkFrontmatter, remarkGfm] });

class StaticError extends Error {}

/** Evaluate a JSON-like expression: literals, arrays, objects, template text and known constants. */
function evaluate(node, scope) {
  switch (node.type) {
    case 'Literal':
      if (node.regex || typeof node.value === 'bigint') throw new StaticError('regular expressions and big integers are not data');
      return node.value;
    case 'TemplateLiteral':
      if (node.expressions.length) throw new StaticError('template literals cannot interpolate values');
      return node.quasis.map((q) => q.value.cooked).join('');
    case 'ArrayExpression':
      return node.elements.map((e) => {
        if (!e || e.type === 'SpreadElement') throw new StaticError('arrays cannot have holes or spreads');
        return evaluate(e, scope);
      });
    case 'ObjectExpression':
      return Object.fromEntries(
        node.properties.map((p) => {
          if (p.type !== 'Property' || p.computed || p.kind !== 'init' || p.method)
            throw new StaticError('objects can only have plain key: value pairs');
          return [p.key.type === 'Identifier' ? p.key.name : String(p.key.value), evaluate(p.value, scope)];
        }),
      );
    case 'UnaryExpression':
      if (node.operator !== '-' || node.argument.type !== 'Literal' || typeof node.argument.value !== 'number')
        throw new StaticError(`the operator '${node.operator}' is not data`);
      return -node.argument.value;
    case 'Identifier':
      if (!Object.hasOwn(scope, node.name)) throw new StaticError(`'${node.name}' is not an exported constant of this page`);
      return scope[node.name];
    default:
      throw new StaticError(`${node.type} is code, not data`);
  }
}

/**
 * Parse one MDX page. Returns frontmatter, the page's exported constants, and its
 * Markdown tree with every JSX attribute replaced by its evaluated value.
 */
export function readMdxPage(source, file, diagnostics) {
  const tree = parser.parse(source);
  let front = {};
  const scope = {};
  for (const node of tree.children) {
    if (node.type === 'yaml') {
      try {
        front = YAML.parse(node.value) ?? {};
      } catch (e) {
        diagnostics.error(file, node, `invalid frontmatter: ${e.message}`);
      }
    }
    if (node.type !== 'mdxjsEsm') continue;
    for (const statement of node.data.estree.body) {
      if (
        statement.type !== 'ExportNamedDeclaration' ||
        statement.declaration?.type !== 'VariableDeclaration' ||
        statement.declaration.kind !== 'const'
      ) {
        diagnostics.error(file, node, 'only `export const NAME = <data>` is allowed; imports and code are not');
        continue;
      }
      for (const declaration of statement.declaration.declarations) {
        try {
          scope[declaration.id.name] = evaluate(declaration.init, scope);
        } catch (e) {
          if (!(e instanceof StaticError)) throw e;
          diagnostics.error(file, node, `export ${declaration.id.name}: ${e.message}`);
        }
      }
    }
  }
  (function resolve(node) {
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      node.props = {};
      for (const attribute of node.attributes) {
        if (attribute.type !== 'mdxJsxAttribute') {
          diagnostics.error(file, node, `<${node.name}>: spread attributes are not allowed`);
          continue;
        }
        if (attribute.value === null) node.props[attribute.name] = true;
        else if (typeof attribute.value === 'string') node.props[attribute.name] = attribute.value;
        else {
          try {
            node.props[attribute.name] = evaluate(attribute.value.data.estree.body[0].expression, scope);
          } catch (e) {
            if (!(e instanceof StaticError)) throw e;
            diagnostics.error(file, node, `<${node.name} ${attribute.name}>: ${e.message}`);
          }
        }
      }
    }
    if (node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression')
      diagnostics.error(file, node, 'inline {expressions} are code; write the text directly');
    if (node.type === 'html') diagnostics.error(file, node, 'raw HTML is not allowed');
    (node.children ?? []).forEach(resolve);
  })(tree);
  return { front, scope, tree };
}
