// The current program, loaded from the compiled content bundle at startup (see
// bootContent). Components import these bindings as before; they are set once, before
// the first render, and never change afterwards.
import { loadLegacy, loadManifest, loadPage, loadSearch, loadSite } from './content';

export let site = null;
export let program = null;
export let course = null;
export let track = null;
export let interfaceContent = {};
export let chapters = [];
export let objectives = [];
export let pages = [];
/** Practice questions across the program, for the learning dashboard. */
export let challenges = [];
let manifest = null;

export const kindLabel = {
  lesson: 'Lesson',
  lab: 'Exercise',
  quiz: 'Quiz',
  summary: 'Summary',
};

/** Load the site index, the program manifest and its interface copy, then install them. */
export async function bootContent() {
  site = await loadSite();
  const entry = site.programs.find((p) => p.status === 'active') ?? site.programs[0];
  manifest = await loadManifest(entry.manifest);
  const legacy = manifest.legacy ? await loadLegacy(manifest.legacy) : null;
  program = manifest.program;
  course = legacy?.course ?? { title: site.site.name, tagline: program.tagline ?? site.site.tagline, repo: site.site.repo };
  track = legacy?.track ?? { id: program.platform.family, label: program.platform.label, platform: { path: '/platform' } };
  interfaceContent = legacy?.interface ?? {};
  objectives = manifest.objectives;
  chapters = manifest.chapters.map((chapter) => ({
    ...chapter,
    comingSoon: chapter.status === 'planned' || chapter.sections.length === 0,
  }));
  pages = chapters.flatMap((chapter) =>
    chapter.sections.map((section, index) => ({
      chapter,
      section,
      index,
      key: `${chapter.id}/${section.slug}`,
      path: `/${chapter.id}/${section.slug}`,
      number: `${chapter.number}.${index + 1}`,
    })),
  );
  challenges = chapters.flatMap((chapter) =>
    chapter.sections.flatMap((section) => (section.activities?.practice ?? []).map((c) => ({ ...c, chapter: chapter.id }))),
  );
}

export function findPage(chapterId, slug) {
  return pages.find((p) => p.chapter.id === chapterId && p.section.slug === slug);
}

export function neighbours(page) {
  const i = pages.indexOf(page);
  return { prev: pages[i - 1] ?? null, next: pages[i + 1] ?? null };
}

export function findChapter(chapterId) {
  return chapters.find((c) => c.id === chapterId);
}

/** A loader for a section's compiled page, or null if it has none. */
export function loaderFor(page) {
  const file = manifest.pages[page.key];
  return file ? () => loadPage(file) : null;
}

/** A loader for the program's details ("platform and versions") page. */
export function referenceLoaderFor() {
  const file = manifest.pages.details;
  return file ? () => loadPage(file) : null;
}

/** The program's search index entries, with their pages resolved. */
export async function loadSearchEntries() {
  const index = await loadSearch(manifest.search);
  const byKey = new Map(pages.map((p) => [p.key, p]));
  return index.entries.filter((e) => byKey.has(e.page)).map((e) => ({ ...e, page: byKey.get(e.page) }));
}
