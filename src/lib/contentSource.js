/** Authored data exports are invisible metadata, not lesson prose or search snippets. */
export function lessonProse(source) {
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/^export const (?:widgetContent|practice) = [\[{][\s\S]*?^[\]}];\s*$/gm, '');
}
