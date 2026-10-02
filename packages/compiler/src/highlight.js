// Syntax highlighting at build time. Code becomes token data (text plus a light and a dark
// colour), so the engine renders plain text spans and never ships a highlighter.
import { createHighlighter } from 'shiki';

const THEMES = { light: 'github-light', dark: 'github-dark' };
const LANGS = [
  'yaml',
  'ini',
  'json',
  'bash',
  'shellsession',
  'jinja',
  'python',
  'diff',
  'toml',
  'xml',
  'html',
  'css',
  'javascript',
  'dockerfile',
];
const ALIASES = { console: 'shellsession', sh: 'bash', shell: 'bash', yml: 'yaml', jinja2: 'jinja', py: 'python' };
const ITALIC = 1;

let highlighter;

export async function initHighlighter() {
  highlighter ??= await createHighlighter({ themes: Object.values(THEMES), langs: LANGS });
  return highlighter;
}

/** Resolve a fenced block's language to one the highlighter knows, or plain text. */
function resolveLang(lang) {
  if (!lang) return 'text';
  const name = ALIASES[lang] ?? lang;
  return highlighter.getLoadedLanguages().includes(name) ? name : 'text';
}

/** Tokenise code into lines of {v, l, d, i}: text, light colour, dark colour, italic. */
export function tokenize(code, lang) {
  if (!highlighter) throw new Error('initHighlighter() must be awaited first');
  const resolved = resolveLang(lang);
  if (resolved === 'text') return code.split('\n').map((line) => (line ? [{ v: line }] : []));
  const lines = highlighter.codeToTokensWithThemes(code, { lang: resolved, themes: THEMES });
  return lines.map((tokens) =>
    tokens.map((token) => {
      const out = { v: token.content };
      const light = token.variants.light;
      const dark = token.variants.dark;
      if (light?.color) out.l = normalise(light.color);
      if (dark?.color) out.d = normalise(dark.color);
      if ((light?.fontStyle ?? 0) & ITALIC) out.i = true;
      return out;
    }),
  );
}

/** Colours are emitted as #rrggbb only. */
function normalise(color) {
  const hex = color.toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-f]{8}$/.test(hex)) return hex.slice(0, 7);
  if (/^#[0-9a-f]{3}$/.test(hex)) return '#' + [...hex.slice(1)].map((c) => c + c).join('');
  throw new Error(`unexpected token colour ${color}`);
}
