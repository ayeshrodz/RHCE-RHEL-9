// The site index and the active program, loaded from the compiled content bundle.
// bootContent loads the site index once; activateProgram installs one program's data.
// Components import the bindings below. They change only when the reader moves to another
// program, and the program route remounts everything beneath it when that happens.
import { loadInterface, loadLegacy, loadManifest, loadPage, loadSearch, loadSite } from './content';
import { readProgramCompleted, setProgramScope } from './storage';

export let site = null;
/** Interface text shared by every program (header, footer, search, sidebar). */
export let sharedInterface = {};
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
// The program the reader asked for most recently. A slower, earlier request must not install itself
// after the reader has moved on (A → B → A would otherwise show B's data under A's address).
let requested = null;

export const kindLabel = {
  lesson: 'Lesson',
  lab: 'Exercise',
  quiz: 'Quiz',
  summary: 'Summary',
};

/** Load the site index. Programs load one at a time, when the reader opens them. */
export async function bootContent() {
  site = await loadSite();
  sharedInterface = site.interface ? (await loadInterface(site.interface)).interface : {};
}

/** The site home page, or null when the content has none. */
export const loadSiteHome = () => (site.site.home ? loadPage(site.site.home) : null);

/** The percentage of a program's pages the reader has completed, from the site index alone. */
export function programPercent(entry) {
  if (!entry.sections) return 0;
  return Math.min(100, Math.round((readProgramCompleted(entry.id).length / entry.sections) * 100));
}

/** The program a bare address opens: the first active one. */
export function defaultProgramId() {
  return (site.programs.find((p) => p.status === 'active') ?? site.programs[0]).id;
}

export const hasProgram = (id) => site.programs.some((p) => p.id === id);

/**
 * Load a program's manifest and interface copy, then make it the active program. Resolves to null,
 * installing nothing, when another program was requested while this one was loading.
 */
export async function activateProgram(id) {
  requested = id;
  if (program?.id === id) return program;
  const entry = site.programs.find((p) => p.id === id);
  const loaded = await loadManifest(entry.manifest);
  const legacy = loaded.legacy ? await loadLegacy(loaded.legacy) : null;
  if (requested !== id) return null;
  manifest = loaded;
  program = manifest.program;
  setProgramScope(program.id);
  course = legacy?.course ?? { title: site.site.name, tagline: program.tagline ?? site.site.tagline, repo: site.site.repo };
  track = legacy?.track ?? {
    id: program.platform.family,
    label: program.platform.label,
    platform: { title: 'Platform and versions', path: '/platform' },
  };
  interfaceContent = { ...sharedInterface, ...(legacy?.interface ?? {}) };
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
  return program;
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

/** Whether the program has a "platform and versions" page. */
export const hasDetails = () => Boolean(manifest?.pages.details);

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
