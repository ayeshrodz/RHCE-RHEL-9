/** Change selected YAML lines without replacing their contents or losing selection. */
export function indentSelection(value, start, end, outdent = false) {
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
  const last = end > start && value[end - 1] === '\n' ? end - 1 : end;
  const next = value.indexOf('\n', last);
  const to = next < 0 ? value.length : next;
  const lines = value.slice(from, to).split('\n');
  const changes = lines.map((line) => (outdent ? -(line.match(/^ {1,2}/)?.[0].length ?? 0) : 2));
  const text = lines.map((line, i) => (outdent ? line.slice(-changes[i]) : `  ${line}`)).join('\n');
  const position = (offset) => {
    let original = from;
    let modified = from;
    for (let i = 0; i < lines.length; i++) {
      if (offset <= original + lines[i].length) return modified + Math.max(0, offset - original + changes[i]);
      original += lines[i].length + 1;
      modified += lines[i].length + changes[i] + 1;
    }
    return offset + changes.reduce((sum, change) => sum + change, 0);
  };
  return {
    value: value.slice(0, from) + text + value.slice(to),
    start: position(start),
    end: position(end),
  };
}
