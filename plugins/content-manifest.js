// Vite plugin: builds the course structure from the content/ folder.
//
//   content/_course.yml                      site-level metadata
//   content/ch01-some-name/_chapter.yml      chapter title, goal, objectives (or status: planned + topics)
//   content/ch01-some-name/03-slug.mdx       a section; frontmatter gives title, kind, minutes
//
// The result is exposed to the app as `virtual:course`. In dev, adding,
// removing or renaming a file, or editing frontmatter / _chapter.yml,
// reloads the page with the new structure. Body edits to .mdx files are
// hot-updated by the MDX + React plugins without touching this module.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const VIRTUAL_ID = 'virtual:course';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export default function contentManifest({ dir = 'content' } = {}) {
  let contentDir;
  let lastJson = '';

  function readYaml(file) {
    if (!fs.existsSync(file)) return {};
    try {
      return YAML.parse(fs.readFileSync(file, 'utf8')) ?? {};
    } catch (e) {
      throw new Error(`Invalid YAML in ${path.relative(process.cwd(), file)}: ${e.message}`);
    }
  }

  function readSection(chapterDir, fileName) {
    const file = path.join(chapterDir, fileName);
    const source = fs.readFileSync(file, 'utf8');
    const match = source.match(FRONTMATTER);
    let data = {};
    if (match) {
      try {
        data = YAML.parse(match[1]) ?? {};
      } catch (e) {
        throw new Error(`Invalid frontmatter in ${path.relative(process.cwd(), file)}: ${e.message}`);
      }
    }
    const base = fileName.replace(/\.mdx$/, '');
    const slug = data.slug ?? base.replace(/^\d+-/, '');
    const body = match ? source.slice(match[0].length) : source;
    return {
      slug,
      file: base,
      title: data.title ?? titleCase(slug),
      kind: data.kind ?? inferKind(slug),
      minutes: data.minutes ?? estimateMinutes(body),
      draft: data.draft === true,
    };
  }

  function buildManifest() {
    const course = readYaml(path.join(contentDir, '_course.yml'));
    const chapters = fs
      .readdirSync(contentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^ch\d+/.test(d.name))
      .map((d) => d.name)
      .sort()
      .map((name) => {
        const chapterDir = path.join(contentDir, name);
        const meta = readYaml(path.join(chapterDir, '_chapter.yml'));
        const id = name.match(/^(ch\d+)/)[1];
        const sections = fs
          .readdirSync(chapterDir)
          .filter((f) => f.endsWith('.mdx'))
          .sort()
          .map((f) => readSection(chapterDir, f))
          .filter((s) => !s.draft);
        return {
          id,
          number: meta.number ?? Number(id.slice(2)),
          dir: name,
          title: meta.title ?? titleCase(name.replace(/^ch\d+-/, '')),
          goal: meta.goal ?? '',
          objectives: meta.objectives ?? [],
          objectiveIds: meta.objectiveIds ?? [],
          topics: meta.topics ?? [],
          sections,
          comingSoon: meta.status === 'planned' || sections.length === 0,
        };
      });
    return { course, chapters, objectives: readYaml(path.join(contentDir, '_objectives.yml')) };
  }

  return {
    name: 'content-manifest',

    configResolved(config) {
      contentDir = path.resolve(config.root, dir);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      const manifest = buildManifest();
      lastJson = JSON.stringify(manifest);
      return `export default ${lastJson};`;
    },

    configureServer(server) {
      const onFsEvent = (file) => {
        if (!file.startsWith(contentDir) || !/\.(mdx|ya?ml)$/.test(file)) return;
        let next;
        try {
          next = JSON.stringify(buildManifest());
        } catch (e) {
          server.config.logger.error(e.message);
          return;
        }
        if (next === lastJson) return; // body-only edit: HMR already handled it
        lastJson = next;
        const graph = server.environments?.client?.moduleGraph ?? server.moduleGraph;
        const mod = graph.getModuleById(RESOLVED_ID);
        if (mod) graph.invalidateModule(mod);
        server.config.logger.info('course structure changed, reloading', { timestamp: true });
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', onFsEvent);
      server.watcher.on('unlink', onFsEvent);
      server.watcher.on('change', onFsEvent);
    },
  };
}

function inferKind(slug) {
  if (/(^|-)lab(-|$)/.test(slug)) return 'lab';
  if (/quiz/.test(slug)) return 'quiz';
  if (/summary/.test(slug)) return 'summary';
  return 'lesson';
}

function estimateMinutes(body) {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(3, Math.round(words / 180));
}

function titleCase(slug) {
  const s = slug.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
