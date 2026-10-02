import path from 'node:path';

/** Collects compile errors with file and line, so authors see every problem at once. */
export class Diagnostics {
  constructor(root) {
    this.root = root;
    this.errors = [];
    this.warnings = [];
  }

  #entry(file, node, message) {
    const line = typeof node === 'number' ? node : node?.position?.start?.line;
    return { file: file ? path.relative(this.root, file) : '(bundle)', line, message };
  }

  error(file, node, message) {
    this.errors.push(this.#entry(file, node, message));
  }

  warn(file, node, message) {
    this.warnings.push(this.#entry(file, node, message));
  }

  get ok() {
    return this.errors.length === 0;
  }

  format() {
    const show = (kind, list) => list.map((e) => `${kind} ${e.file}${e.line ? `:${e.line}` : ''}  ${e.message}`);
    return [...show('error', this.errors), ...show('warning', this.warnings)].join('\n');
  }
}

/** Thrown when compilation cannot continue; carries the diagnostics so far. */
export class CompileError extends Error {
  constructor(diagnostics) {
    super(`${diagnostics.errors.length} content error(s)\n${diagnostics.format()}`);
    this.diagnostics = diagnostics;
  }
}
