// Generates what authors read and what their editor uses, from the component catalog:
//   docs/CATALOG.md                       every tag, its attributes and where it may be used
//   .vscode/kernel-path.code-snippets     one snippet per tag (type "kp-" for the list)
//   node scripts/generate-authoring-support.mjs [--check]   --check fails when a file is out of date
import fs from 'node:fs';
import { catalog } from '@kernel-path/schema';

const tags = Object.entries(catalog.components)
  .filter(([, c]) => c.status !== 'planned')
  .sort(([a], [b]) => a.localeCompare(b));

// ---------- the reference ----------

const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const kind = (a) => (a.enum ? a.enum.map((v) => `\`${v}\``).join(', ') : a.type + (a.type === 'string' && a.format ? ` (${a.format})` : '') + (a.minimum !== undefined || a.maximum !== undefined ? ` (${a.minimum ?? ''}–${a.maximum ?? ''})` : ''));

let doc = `# Component catalog

Every tag a page may use. This file is generated from \`packages/schema/catalog/components.json\`; do not edit it. Pages write a tag as \`{% name attribute="value" %}…{% /name %}\`, or \`{% name … /%}\` when it holds nothing. Attribute values are text in double quotes, numbers, \`true\`/\`false\`, or a list such as \`["a", "b"]\`.

${tags.map(([name]) => `[\`${name}\`](#${name})`).join(' · ')}

`;
for (const [name, c] of tags) {
  doc += `## ${name}\n\n${c.summary}${c.status === 'legacy' ? ' _Transitional: being replaced by generic components._' : ''}\n\n`;
  const facts = [`**Where:** ${c.placement === 'inline' ? 'inside a line of text' : 'on its own lines'}`];
  if (c.parents) facts.push(`**Inside:** ${c.parents.map((p) => `\`${p}\``).join(' or ')}`);
  facts.push(
    `**Holds:** ${{ none: 'nothing (write it as `/%}`)', markdown: 'Markdown', inline: 'inline text', tags: `only ${(c.allowedChildren ?? []).map((t) => `\`${t}\``).join(', ')}` }[c.children] ?? c.children}`,
  );
  if (c.data) facts.push(`**Page data:** \`ref\` names an entry in the page's \`.data.yml\`, checked against \`${c.data}\``);
  if (c.replacedBy) facts.push(`**Replaced by:** \`${c.replacedBy}\``);
  doc += facts.join(' · ') + '\n\n';
  const attributes = Object.entries(c.attributes ?? {});
  if (attributes.length) {
    doc += '| Attribute | Value | Required | Meaning |\n| --- | --- | --- | --- |\n';
    for (const [attribute, a] of attributes) {
      const values = name === 'legacy-widget' && attribute === 'name' ? 'one of the widget names in the catalog file' : kind(a);
      doc += `| \`${attribute}\` | ${cell(values)}${a.default !== undefined ? ` (default \`${a.default}\`)` : ''} | ${(c.required ?? []).includes(attribute) ? 'yes' : ''} | ${cell(a.description)} |\n`;
    }
    doc += '\n';
  }
}

// ---------- editor snippets ----------

const snippets = {};
for (const [name, c] of tags) {
  if (name === 'legacy-widget') continue;
  let stop = 0;
  // Required attributes become tab stops; a tag with none offers its first two optional ones.
  const all = Object.entries(c.attributes ?? {});
  const wanted = all.filter(([key]) => (c.required ?? []).includes(key));
  const attributes = (wanted.length ? wanted : all.slice(0, 2))
    .map(([key, a]) => {
      stop++;
      const value = a.enum && a.type === 'string' ? `"\${${stop}|${a.enum.join(',')}|}"` : a.type === 'integer' || a.type === 'number' ? `\${${stop}:1}` : a.type === 'boolean' ? `\${${stop}|true,false|}` : a.type === 'string[]' ? `["\${${stop}}"]` : `"\${${stop}}"`;
      return ` ${key}=${value}`;
    })
    .join('');
  const body = c.children === 'none' ? [`{% ${name}${attributes} /%}`] : [`{% ${name}${attributes} %}`, c.children === 'tags' ? '\t$0' : '$0', `{% /${name} %}`];
  snippets[`kp-${name}`] = { prefix: `kp-${name}`, description: c.summary, body };
}
const snippetFile = JSON.stringify(snippets, null, 2) + '\n';

const outputs = [
  ['docs/CATALOG.md', doc],
  ['.vscode/kernel-path.code-snippets', snippetFile],
];
let stale = false;
for (const [file, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) {
      console.error(`${file} is out of date: run node scripts/generate-authoring-support.mjs`);
      stale = true;
    }
  } else {
    fs.mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(file, content);
  }
}
if (stale) process.exit(1);
console.log(process.argv.includes('--check') ? 'Authoring support files are up to date.' : `Wrote ${outputs.map(([f]) => f).join(' and ')}.`);
