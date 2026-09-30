import GithubSlugger from 'github-slugger';
import { loadRawSources, pages } from '@/lib/course';

let indexPromise = null;

/** Split every MDX page into heading-sized chunks of plain text. Built once, lazily. */
export function getIndex() {
  indexPromise ??= loadRawSources().then((sources) => {
    const entries = [];
    for (const page of pages) {
      const slugger = new GithubSlugger();
      let heading = null;
      let anchor = null;
      let buf = [];
      const flush = () => {
        const text = clean(buf.join(' '));
        if (text || heading) entries.push({ page, heading, anchor, text });
        buf = [];
      };
      const source = (sources[page.key] ?? '').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
      for (const line of source.split('\n')) {
        const h = line.match(/^(##{1,2})\s+(.+)$/);
        if (h) {
          flush();
          heading = h[2].replace(/`/g, '').trim();
          anchor = slugger.slug(h[2].trim());
        } else {
          buf.push(line);
        }
      }
      flush();
    }
    return entries;
  });
  return indexPromise;
}

function clean(s) {
  return s
    .replace(/^import .*$/gm, '')
    .replace(/<\/?[A-Z][^>]*>/g, ' ') // JSX tags
    .replace(/\{[^{}]*\}/g, ' ') // JSX expressions
    .replace(/[#>*`|]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function search(entries, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const results = [];
  for (const e of entries) {
    const title = e.page.section.title.toLowerCase();
    const heading = (e.heading ?? '').toLowerCase();
    const text = e.text.toLowerCase();
    let score = 0;
    let ok = true;
    for (const t of terms) {
      const inTitle = title.includes(t);
      const inHeading = heading.includes(t);
      const inText = text.includes(t);
      if (!inTitle && !inHeading && !inText) {
        ok = false;
        break;
      }
      score += inTitle ? 6 : 0;
      score += inHeading ? 4 : 0;
      score += inText ? 1 : 0;
    }
    if (ok) results.push({ ...e, score, snippet: snippet(e.text, terms[0]) });
  }
  results.sort((a, b) => b.score - a.score);
  // Keep at most two hits per page so one page does not flood the list.
  const perPage = new Map();
  return results
    .filter((r) => {
      const n = perPage.get(r.page.key) ?? 0;
      perPage.set(r.page.key, n + 1);
      return n < 2;
    })
    .slice(0, 12);
}

function snippet(text, term) {
  const i = text.toLowerCase().indexOf(term);
  if (i < 0) return text.slice(0, 140);
  const start = Math.max(0, i - 60);
  return (start > 0 ? '…' : '') + text.slice(start, i + 100) + (i + 100 < text.length ? '…' : '');
}
