// Course structure, generated from the content/ folder by
// plugins/content-manifest.js. To add a section, drop an .mdx file into a
// chapter folder; to add a chapter, create a folder with a _chapter.yml.
import manifest from 'virtual:course';

export const course = manifest.course;
export const track = manifest.track;
export const chapters = manifest.chapters;
export const objectives = manifest.objectives;

export const kindLabel = {
  lesson: 'Lesson',
  lab: 'Exercise',
  quiz: 'Quiz',
  summary: 'Summary',
};

/** Flat, ordered list of every readable page. */
export const pages = chapters.flatMap((chapter) =>
  chapter.sections.map((section, index) => ({
    chapter,
    section,
    index,
    key: `${chapter.id}/${section.slug}`,
    path: `/${chapter.id}/${section.slug}`,
    number: `${chapter.number}.${index + 1}`,
  })),
);

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

// Lazy MDX loaders, keyed "<dir>/<file>".
const loaders = import.meta.glob('/content/**/*.mdx');

export function loaderFor(page) {
  return loaders[`/content/${page.chapter.dir}/${page.section.file}.mdx`];
}

export function referenceLoaderFor(page) {
  return loaders[`/content/${page.contentFile}`];
}

// Raw sources, loaded only when search is first opened.
const rawSources = import.meta.glob('/content/**/*.mdx', { query: '?raw', import: 'default' });

export async function loadRawSources() {
  const entries = await Promise.all(
    pages.map(async (page) => {
      const load = rawSources[`/content/${page.chapter.dir}/${page.section.file}.mdx`];
      return [page.key, load ? await load() : ''];
    }),
  );
  return Object.fromEntries(entries);
}
