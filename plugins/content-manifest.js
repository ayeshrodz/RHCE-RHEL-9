import { lessonProse } from '../src/lib/contentSource.js';
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
import { createProcessor } from '@mdx-js/mdx';
import { questionRevision } from '../src/lib/progressModel.js';
import { readTrack } from '../scripts/read-track.mjs';

const activityParser = createProcessor();
const literal = (node) =>
  node?.type === 'ArrayExpression'
    ? node.elements.map(literal)
    : node?.type === 'TemplateLiteral'
      ? node.quasis.map((q) => q.value.cooked).join('')
      : node?.value;
function readActivities(body) {
  const quizzes = [];
  const tasks = [];
  function visit(node, labId = 'lab') {
    const attribute = (name) => node.attributes?.find((a) => a.name === name)?.value;
    if (node.name === 'Lab') labId = attribute('id') ?? 'lab';
    if (node.name === 'Task') tasks.push({ id: attribute('id'), title: attribute('title'), labId });
    if (node.name === 'Quiz') {
      const items = attribute('questions').data.estree.body[0].expression.elements;
      for (const item of items) {
        const q = Object.fromEntries(item.properties.map((p) => [p.key.name, literal(p.value)]));
        quizzes.push({ id: q.id, prompt: q.q, quizId: attribute('id') ?? 'quiz', revision: questionRevision(q) });
      }
    }
    for (const child of node.children ?? []) visit(child, labId);
  }
  visit(activityParser.parse(body));
  return { quizzes, tasks };
}

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
      activities: readActivities(body),
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
    const interfaceContent = {
      ...JSON.parse(fs.readFileSync(path.join(contentDir, '_interface.json'), 'utf8')),
      HomePage: JSON.parse(fs.readFileSync(path.join(contentDir, 'home.json'), 'utf8')),
      ProgressPage: JSON.parse(fs.readFileSync(path.join(contentDir, 'progress.json'), 'utf8')),
    };
    return {
      course,
      chapters,
      interfaceContent,
      track: readTrack(contentDir, course.track),
      objectives: readYaml(path.join(contentDir, '_objectives.yml')),
    };
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
        if (!file.startsWith(contentDir) || !/\.(mdx|json|ya?ml)$/.test(file)) return;
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
  body = lessonProse(body);
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
