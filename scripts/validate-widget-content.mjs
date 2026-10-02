import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}
const contracts = new Map();
for (const file of files('src').filter((file) => file.endsWith('.jsx'))) {
  const source = fs.readFileSync(file, 'utf8');
  const name = source.match(/defineWidget\('([^']+)'/)?.[1];
  if (!name) continue;
  const required = [...source.matchAll(/copy\.(data|text)\.(\w+)/g)].map((match) => [match[1], match[2]]);
  const dependencies = [...source.matchAll(/import (\w+) from ['"](?:\.\.\/|\.\/)[^'"]+['"]/g)].map((match) => match[1]);
  contracts.set(name, { required, dependencies });
}
function validate(catalog, file) {
  assert(catalog && typeof catalog === 'object' && !Array.isArray(catalog), `${file}: expected a widget content object`);
  for (const [name, copy] of Object.entries(catalog)) {
    const contract = contracts.get(name);
    // Shared UI data can also serve components without a factory.
    if (!contract) {
      assert(['Diagram', 'Outline', 'CodeBlock', 'ProgressMenu'].includes(name), `${file}: unknown authored component ${name}`);
      continue;
    }
    for (const [group, key] of contract.required) {
      assert(copy[group] && Object.hasOwn(copy[group], key), `${file}: ${name} missing ${group}.${key}`);
      if (group === 'text') assert(typeof copy[group][key] === 'string' && copy[group][key].trim(), `${file}: ${name}.${key} needs text`);
    }
    for (const child of contract.dependencies.filter((name) => contracts.has(name))) assert(catalog[child], `${file}: ${name} needs ${child} content`);
  }
}
const shared = { ...JSON.parse(fs.readFileSync('content/_interface.json')), HomePage: JSON.parse(fs.readFileSync('content/home.json')), ProgressPage: JSON.parse(fs.readFileSync('content/progress.json')) };
validate(shared, 'content/_interface.json + home.json');
let count = 0;
for (const file of files('content').filter((file) => file.endsWith('.mdx'))) {
  const source = fs.readFileSync(file, 'utf8');
  const declaration = source.match(/^export const widgetContent = (\{[\s\S]*?^\});/m);
  const catalog = declaration ? JSON.parse(declaration[1]) : {};
  validate(catalog, file);
  const prose = source.replace(/^export const widgetContent = \{[\s\S]*?^\};/m, '');
  for (const name of new Set([...prose.matchAll(/<([A-Z]\w*)\b/g)].map((match) => match[1]))) {
    if (contracts.has(name)) assert(catalog[name] || shared[name], `${file}: missing ${name} content`);
  }
  count += Object.keys(catalog).length;
}
console.log(`Validated ${count} page-owned widget catalogs and ${Object.keys(shared).length} shared catalogs.`);
