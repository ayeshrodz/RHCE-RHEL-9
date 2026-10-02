// Writes the site's name and description from the content bundle into the built
// index.html, so the deployed page has proper metadata while the engine stays generic.
//   node scripts/inject-meta.mjs <dist-dir>
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const site = JSON.parse(fs.readFileSync(path.join(dist, 'content/site.json'), 'utf8'));
const escape = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const program = site.programs.find((p) => p.status === 'active') ?? site.programs[0];
const title = `${site.site.name} · ${site.site.tagline}`;
const description = site.site.description ?? program.summary;
const file = path.join(dist, 'index.html');
const html = fs
  .readFileSync(file, 'utf8')
  .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
  .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escape(description)}" />`);
fs.writeFileSync(file, html);
console.log(`index.html: ${title}`);
