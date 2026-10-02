import { loadSearchEntries } from '@/lib/course';

let indexPromise = null;

/** The program's search entries (heading-sized chunks of plain text), loaded once on first search. */
export function getIndex() {
  indexPromise ??= loadSearchEntries().catch((error) => {
    indexPromise = null;
    throw error;
  });
  return indexPromise;
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
