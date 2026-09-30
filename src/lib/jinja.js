// A small Jinja2 interpreter for the template playground: expressions,
// filters, for (with an inline "if"), if/elif/else and set. It follows the
// settings Ansible's template module uses: undefined variables are errors and
// the newline after a block tag is removed (trim_blocks).

class Undefined {
  constructor(name, message) {
    this.name = name;
    this.message = message ?? `'${name}' is undefined`;
  }
}
const isUndef = (v) => v instanceof Undefined;

/* ---------- tokenising the template ---------- */

function lex(src) {
  const out = [];
  const re = /\{\{-?|\{%-?|\{#-?/g;
  let pos = 0;
  let m;
  while ((m = re.exec(src))) {
    const open = m[0];
    const kind = open[1];
    const close = kind === '{' ? '}}' : kind === '%' ? '%}' : '#}';
    const end = src.indexOf(close, m.index);
    if (end < 0) throw new Error(`Missing "${close}" to close "${open.slice(0, 2)}"`);
    let text = src.slice(pos, m.index);
    if (open.endsWith('-')) text = text.replace(/\s+$/, '');
    if (text) out.push({ t: 'text', v: text });
    let inner = src.slice(m.index + open.length, end);
    const rstrip = inner.endsWith('-');
    if (rstrip) inner = inner.slice(0, -1);
    out.push({ t: kind === '{' ? 'var' : kind === '%' ? 'block' : 'comment', v: inner.trim() });
    pos = end + 2;
    if (rstrip) pos += src.slice(pos).match(/^\s*/)[0].length;
    else if (kind !== '{' && src[pos] === '\n') pos += 1; // trim_blocks
    re.lastIndex = pos;
  }
  if (pos < src.length) out.push({ t: 'text', v: src.slice(pos) });
  return out;
}

/* ---------- expressions ---------- */

const TOKEN =
  /\s*(?:(\d+\.\d+|\d+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_][A-Za-z0-9_]*)|(==|!=|<=|>=|\/\/|[-+*\/%~<>()[\],.|:{}]))/y;

function tokenize(s) {
  const toks = [];
  TOKEN.lastIndex = 0;
  let pos = 0;
  while (pos < s.length) {
    if (/^\s*$/.test(s.slice(pos))) break;
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(s);
    if (!m) throw new Error(`Unexpected "${s.slice(pos).trim()[0]}" in "${s}"`);
    pos = TOKEN.lastIndex;
    if (m[1] !== undefined) toks.push({ k: 'num', v: Number(m[1]) });
    else if (m[2] !== undefined) toks.push({ k: 'str', v: m[2].slice(1, -1).replace(/\\n/g, '\n').replace(/\\(.)/g, '$1') });
    else if (m[3] !== undefined) toks.push({ k: 'name', v: m[3] });
    else toks.push({ k: 'op', v: m[4] });
  }
  return toks;
}

function parseExpr(src) {
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const isOp = (v) => peek()?.k === 'op' && peek().v === v;
  const isName = (v) => peek()?.k === 'name' && peek().v === v;
  const eat = (v) => {
    if (!isOp(v)) throw new Error(`Expected "${v}" in "${src}"`);
    i += 1;
  };

  const or = () => {
    let l = and();
    while (isName('or')) {
      i += 1;
      const a = l;
      const b = and();
      l = (c) => (truthy(a(c)) ? a(c) : b(c));
    }
    return l;
  };
  const and = () => {
    let l = not();
    while (isName('and')) {
      i += 1;
      const a = l;
      const b = not();
      l = (c) => (truthy(a(c)) ? b(c) : a(c));
    }
    return l;
  };
  const not = () => {
    if (isName('not')) {
      i += 1;
      const a = not();
      return (c) => !truthy(a(c));
    }
    return compare();
  };
  const compare = () => {
    const l = add();
    const t = peek();
    if (t?.k === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(t.v)) {
      i += 1;
      const r = add();
      const f = {
        '==': (a, b) => equal(a, b),
        '!=': (a, b) => !equal(a, b),
        '<': (a, b) => a < b,
        '>': (a, b) => a > b,
        '<=': (a, b) => a <= b,
        '>=': (a, b) => a >= b,
      }[t.v];
      return (c) => f(need(l(c)), need(r(c)));
    }
    if (isName('in') || (isName('not') && toks[i + 1]?.v === 'in')) {
      const neg = isName('not');
      i += neg ? 2 : 1;
      const r = add();
      return (c) => contains(need(r(c)), need(l(c))) !== neg;
    }
    if (isName('is')) {
      i += 1;
      const neg = isName('not');
      if (neg) i += 1;
      const test = peek();
      if (test?.k !== 'name') throw new Error(`Expected a test name after "is" in "${src}"`);
      i += 1;
      return (c) => runTest(test.v, l(c)) !== neg;
    }
    return l;
  };
  const add = () => {
    let l = mul();
    while (isOp('+') || isOp('-') || isOp('~')) {
      const op = peek().v;
      i += 1;
      const a = l;
      const b = mul();
      l =
        op === '~'
          ? (c) => str(need(a(c))) + str(need(b(c)))
          : op === '+'
            ? (c) => {
                const x = need(a(c));
                const y = need(b(c));
                return Array.isArray(x) ? [...x, ...y] : x + y;
              }
            : (c) => need(a(c)) - need(b(c));
    }
    return l;
  };
  const mul = () => {
    let l = unary();
    while (isOp('*') || isOp('/') || isOp('//') || isOp('%')) {
      const op = peek().v;
      i += 1;
      const a = l;
      const b = unary();
      const f = { '*': (x, y) => x * y, '/': (x, y) => x / y, '//': (x, y) => Math.floor(x / y), '%': (x, y) => x % y }[op];
      l = (c) => f(need(a(c)), need(b(c)));
    }
    return l;
  };
  const unary = () => {
    if (isOp('-')) {
      i += 1;
      const a = unary();
      return (c) => -need(a(c));
    }
    return postfix();
  };
  const args = () => {
    const list = [];
    eat('(');
    while (!isOp(')')) {
      list.push(or());
      if (isOp(',')) i += 1;
    }
    eat(')');
    return list;
  };
  const postfix = () => {
    let l = primary();
    for (;;) {
      if (isOp('.')) {
        i += 1;
        const name = peek();
        if (name?.k !== 'name' && name?.k !== 'num') throw new Error(`Expected a name after "." in "${src}"`);
        i += 1;
        const a = l;
        l = (c) => lookup(a(c), name.v, `.${name.v}`);
      } else if (isOp('[')) {
        i += 1;
        const key = or();
        eat(']');
        const a = l;
        l = (c) => {
          const k = need(key(c));
          return lookup(a(c), k, typeof k === 'number' ? `[${k}]` : `['${k}']`);
        };
      } else if (isOp('|')) {
        i += 1;
        const name = peek();
        if (name?.k !== 'name') throw new Error(`Expected a filter name after "|" in "${src}"`);
        i += 1;
        const fargs = isOp('(') ? args() : [];
        const a = l;
        l = (c) =>
          applyFilter(
            name.v,
            a(c),
            fargs.map((f) => need(f(c))),
          );
      } else return l;
    }
  };
  const primary = () => {
    const t = peek();
    if (!t) throw new Error(`Unexpected end of expression in "${src}"`);
    i += 1;
    if (t.k === 'num' || t.k === 'str') return () => t.v;
    if (t.k === 'name') {
      if (/^(true|True)$/.test(t.v)) return () => true;
      if (/^(false|False)$/.test(t.v)) return () => false;
      if (/^(none|None)$/.test(t.v)) return () => null;
      return (c) => (t.v in c ? c[t.v] : new Undefined(t.v));
    }
    if (t.v === '(') {
      const e = or();
      eat(')');
      return e;
    }
    if (t.v === '[') {
      const items = [];
      while (!isOp(']')) {
        items.push(or());
        if (isOp(',')) i += 1;
      }
      eat(']');
      return (c) => items.map((f) => need(f(c)));
    }
    throw new Error(`Unexpected "${t.v}" in "${src}"`);
  };

  const fn = or();
  if (i < toks.length) throw new Error(`Unexpected "${toks[i].v}" in "${src}"`);
  return fn;
}

/* ---------- values ---------- */

function need(v) {
  if (isUndef(v)) throw new Error(v.message);
  return v;
}
function lookup(obj, key, label) {
  if (isUndef(obj)) return obj;
  if (obj === null || typeof obj !== 'object' || !(key in obj)) {
    return new Undefined(label, `'${describe(obj)}' has no attribute ${typeof key === 'number' ? key : `'${key}'`}`);
  }
  return obj[key];
}
const describe = (v) =>
  Array.isArray(v) ? 'list object' : v && typeof v === 'object' ? 'dict object' : typeof v === 'string' ? 'str object' : 'value';
const truthy = (v) =>
  !(
    isUndef(v) ||
    v === null ||
    v === false ||
    v === 0 ||
    v === '' ||
    (Array.isArray(v) && !v.length) ||
    (typeof v === 'object' && v && !Array.isArray(v) && !Object.keys(v).length)
  );
const equal = (a, b) => (a && typeof a === 'object' ? JSON.stringify(a) === JSON.stringify(b) : a === b);
const contains = (hay, x) =>
  typeof hay === 'string'
    ? hay.includes(String(x))
    : Array.isArray(hay)
      ? hay.some((h) => equal(h, x))
      : hay && typeof hay === 'object'
        ? x in hay
        : false;

/** Python-style text for a value, as Jinja2 prints it. */
export function str(v, nested = false) {
  if (v === null) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') return nested ? `'${v.replace(/'/g, "\\'")}'` : v;
  if (Array.isArray(v)) return `[${v.map((x) => str(x, true)).join(', ')}]`;
  if (typeof v === 'object')
    return `{${Object.entries(v)
      .map(([k, x]) => `'${k}': ${str(x, true)}`)
      .join(', ')}}`;
  return String(v);
}

function yaml(v, indent = 0) {
  const pad = ' '.repeat(indent);
  if (Array.isArray(v)) return v.length ? v.map((x) => `${pad}- ${scalarOrNested(x, indent + 2)}`).join('\n') : `${pad}[]`;
  if (v && typeof v === 'object')
    return Object.entries(v)
      .map(([k, x]) => `${pad}${k}:${x && typeof x === 'object' ? `\n${yaml(x, indent + 2)}` : ` ${yamlScalar(x)}`}`)
      .join('\n');
  return pad + yamlScalar(v);
}
const yamlScalar = (v) => (v === null ? 'null' : typeof v === 'boolean' ? String(v) : String(v));
const scalarOrNested = (x, indent) => (x && typeof x === 'object' ? yaml(x, indent).trimStart() : yamlScalar(x));

const FILTERS = {
  upper: (v) => str(v).toUpperCase(),
  lower: (v) => str(v).toLowerCase(),
  capitalize: (v) => str(v).charAt(0).toUpperCase() + str(v).slice(1).toLowerCase(),
  title: (v) => str(v).replace(/\b\w/g, (c) => c.toUpperCase()),
  trim: (v) => str(v).trim(),
  replace: (v, a, b) => str(v).split(a).join(b),
  string: (v) => str(v),
  int: (v) => parseInt(v, 10) || 0,
  float: (v) => parseFloat(v) || 0,
  bool: (v) => (typeof v === 'string' ? /^(1|true|yes|on)$/i.test(v) : Boolean(v)),
  round: (v, n = 0) => Number(Number(v).toFixed(n)),
  abs: (v) => Math.abs(v),
  length: (v) => (typeof v === 'object' && v && !Array.isArray(v) ? Object.keys(v).length : v.length),
  count: (v) => FILTERS.length(v),
  first: (v) => v[0],
  last: (v) => v[v.length - 1],
  min: (v) => Math.min(...v),
  max: (v) => Math.max(...v),
  sort: (v) => [...v].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)),
  reverse: (v) => (typeof v === 'string' ? [...v].reverse().join('') : [...v].reverse()),
  unique: (v) => v.filter((x, i) => v.findIndex((y) => equal(x, y)) === i),
  list: (v) => (typeof v === 'string' ? [...v] : Array.isArray(v) ? v : Object.keys(v)),
  join: (v, sep = '') => v.map((x) => str(x)).join(sep),
  basename: (v) => str(v).split('/').pop(),
  dirname: (v) => str(v).split('/').slice(0, -1).join('/') || '/',
  to_json: (v) => JSON.stringify(v).replace(/":/g, '": ').replace(/,"/g, ', "'),
  to_nice_json: (v) => JSON.stringify(v, null, 4),
  to_yaml: (v) => `${yaml(v)}\n`,
  to_nice_yaml: (v) => `${yaml(v)}\n`,
  from_json: (v) => JSON.parse(v),
};

function applyFilter(name, value, args) {
  if (name === 'default' || name === 'd') return isUndef(value) || (args[1] && !truthy(value)) ? (args[0] ?? '') : value;
  const f = FILTERS[name];
  if (!f) throw new Error(`No filter named '${name}' (this playground knows: ${['default', ...Object.keys(FILTERS)].join(', ')})`);
  return f(need(value), ...args);
}

function runTest(name, v) {
  switch (name) {
    case 'defined':
      return !isUndef(v);
    case 'undefined':
      return isUndef(v);
    case 'none':
      return need(v) === null;
    case 'string':
      return typeof need(v) === 'string';
    case 'number':
      return typeof need(v) === 'number';
    case 'iterable':
      return Array.isArray(need(v)) || typeof v === 'string';
    case 'mapping':
      return Boolean(v) && typeof need(v) === 'object' && !Array.isArray(v);
    default:
      throw new Error(`No test named '${name}'`);
  }
}

/* ---------- statements ---------- */

function parse(tokens) {
  let i = 0;
  const body = (...stops) => {
    const nodes = [];
    while (i < tokens.length) {
      const tok = tokens[i];
      if (tok.t === 'block') {
        const word = tok.v.split(/\s+/)[0];
        if (stops.includes(word)) return nodes;
        i += 1;
        if (word === 'for') nodes.push(forNode(tok.v));
        else if (word === 'if') nodes.push(ifNode(tok.v));
        else if (word === 'set') {
          const m = tok.v.match(/^set\s+([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
          if (!m) throw new Error(`Cannot read "{% ${tok.v} %}"`);
          nodes.push({ n: 'set', name: m[1], expr: parseExpr(m[2]) });
        } else throw new Error(`Unexpected "{% ${tok.v} %}"${/^end/.test(word) ? ': nothing open to close' : ''}`);
      } else {
        i += 1;
        if (tok.t === 'text') nodes.push({ n: 'text', v: tok.v });
        else if (tok.t === 'var') nodes.push({ n: 'out', expr: parseExpr(tok.v), src: tok.v });
      }
    }
    if (stops.length) throw new Error(`Missing {% ${stops.find((w) => w.startsWith('end'))} %}`);
    return nodes;
  };
  const forNode = (src) => {
    const m = src.match(/^for\s+([A-Za-z_]\w*)\s+in\s+([\s\S]+?)(?:\s+if\s+([\s\S]+))?$/);
    if (!m) throw new Error(`Cannot read "{% ${src} %}"`);
    const node = {
      n: 'for',
      name: m[1],
      list: parseExpr(m[2]),
      cond: m[3] ? parseExpr(m[3]) : null,
      body: body('endfor', 'else'),
      empty: [],
    };
    if (tokens[i]?.v === 'else') {
      i += 1;
      node.empty = body('endfor');
    }
    i += 1;
    return node;
  };
  const ifNode = (src) => {
    const branches = [{ cond: parseExpr(src.replace(/^(el)?if\s+/, '')), body: body('elif', 'else', 'endif') }];
    let otherwise = [];
    for (;;) {
      const tok = tokens[i];
      i += 1;
      if (tok.v.startsWith('elif')) branches.push({ cond: parseExpr(tok.v.replace(/^elif\s+/, '')), body: body('elif', 'else', 'endif') });
      else if (tok.v === 'else') otherwise = body('endif');
      else break;
    }
    return { n: 'if', branches, otherwise };
  };
  return body();
}

function run(nodes, ctx) {
  let out = '';
  for (const node of nodes) {
    if (node.n === 'text') out += node.v;
    else if (node.n === 'out') out += str(need(node.expr(ctx)));
    else if (node.n === 'set') ctx[node.name] = need(node.expr(ctx));
    else if (node.n === 'if') {
      const hit = node.branches.find((b) => truthy(b.cond(ctx)));
      out += run(hit ? hit.body : node.otherwise, ctx);
    } else if (node.n === 'for') {
      let items = need(node.list(ctx));
      if (items && typeof items === 'object' && !Array.isArray(items)) items = Object.keys(items);
      if (typeof items === 'string') items = [...items];
      if (!Array.isArray(items)) throw new Error(`'${str(items)}' is not something a for loop can go through`);
      if (node.cond) items = items.filter((it) => truthy(node.cond({ ...ctx, [node.name]: it })));
      if (!items.length) out += run(node.empty, ctx);
      items.forEach((it, idx) => {
        const loop = { index: idx + 1, index0: idx, first: idx === 0, last: idx === items.length - 1, length: items.length };
        out += run(node.body, { ...ctx, [node.name]: it, loop });
      });
    }
  }
  return out;
}

/** Render a template with a context object. Throws Error with a readable message. */
export function render(template, context) {
  return run(parse(lex(template)), { ...context });
}
