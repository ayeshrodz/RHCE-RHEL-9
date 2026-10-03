// YAML is read as plain data only: no custom tags, no unresolved tags, no duplicate keys, and
// alias expansion is capped. Anything the parser would warn about or silently skip is an error.
import YAML from 'yaml';

export function parseYaml(text) {
  const document = YAML.parseDocument(text, { maxAliasCount: 20, uniqueKeys: true });
  const problem = document.errors[0] ?? document.warnings[0];
  if (problem) throw new Error(problem.message.split('\n')[0]);
  return document.toJS();
}
