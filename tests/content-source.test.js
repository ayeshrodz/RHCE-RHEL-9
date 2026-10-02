import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonProse } from '../src/lib/contentSource.js';
test('search and reading time exclude authored data without losing lesson headings', () => {
  const source = '---\ntitle: Example\n---\n\nexport const widgetContent = {\n  "Example": {"text": "secret metadata"}\n};\n\nexport const practice = [\n  {"answer": "hidden solution"}\n];\n\n## Try it\nKeep this sentence.\n';
  assert.equal(lessonProse(source).trim(), '## Try it\nKeep this sentence.');
});
test('ordinary code examples and braces remain searchable', () => {
  const source = '## Variables\n```yaml\nname: "{{ value }}"\n```';
  assert.equal(lessonProse(source), source);
});
