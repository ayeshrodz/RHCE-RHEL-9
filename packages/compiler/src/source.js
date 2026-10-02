// Reads the content source tree:
//
//   site.yml                               site identity and program order
//   site/home.md                           optional home page of the whole site
//   interface.json                         interface text shared by every program (transitional)
//   programs/<id>/program.yml              the program definition
//   programs/<id>/objectives.yml           skills mapped to lessons, practice and labs
//   programs/<id>/details.md               optional "platform and versions" page
//   programs/<id>/chapters/chNN-<name>/    _chapter.yml and NN-<slug>.md sections
//   programs/<id>/lab/<name>.yml           an exercise: starter files, setup actions, graded checkpoints
//   programs/<id>/lab/<name>/starter/      the exercise's starter files
//   programs/<id>/lab/<name>/trees/        file trees that setup actions use (for example Git history)
//   programs/<id>/legacy.yml, interface.json, home.json, progress.json
//                                          transitional interface copy (see the legacy bundle)
//
// Reading only gathers files; checking against the contract happens in the compiler.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/** A page's optional data file sits beside it: NN-slug.md → NN-slug.data.yml. */
function readData(file) {
  const dataFile = file.replace(/\.md$/, '.data.yml');
  return { dataFile, dataSource: fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf8') : null };
}

const readYaml = (file, fallback = {}) => (fs.existsSync(file) ? (YAML.parse(fs.readFileSync(file, 'utf8')) ?? fallback) : fallback);
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function readChapters(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^ch\d{2}-/.test(d.name))
    .map((d) => d.name)
    .sort()
    .map((name) => {
      const chapterDir = path.join(dir, name);
      const id = name.slice(0, 4);
      const meta = readYaml(path.join(chapterDir, '_chapter.yml'));
      const sections = fs
        .readdirSync(chapterDir)
        .filter((f) => f.endsWith('.md') && !f.endsWith('.data.yml'))
        .sort()
        .map((file) => {
          const full = path.join(chapterDir, file);
          const source = fs.readFileSync(full, 'utf8');
          const front = YAML.parse(source.match(FRONTMATTER)?.[0].replace(/^---\r?\n|\r?\n---\r?\n?$/g, '') ?? '') ?? {};
          const slug = front.slug ?? file.replace(/\.md$/, '').replace(/^\d+-/, '');
          return { file: full, source, ...readData(full), front, slug, kind: front.kind, minutes: front.minutes };
        })
        .filter((s) => s.front.draft !== true);
      return { id, dir: chapterDir, meta, number: meta.number ?? Number(id.slice(2)), sections };
    });
}

/** Lab exercise definitions: programs/<id>/lab/<name>.yml, with files beside them in lab/<name>/. */
function readLabs(dir) {
  const labDir = path.join(dir, 'lab');
  if (!fs.existsSync(labDir)) return [];
  return fs
    .readdirSync(labDir)
    .filter((f) => f.endsWith('.yml'))
    .sort()
    .map((f) => ({
      file: path.join(labDir, f),
      file_name: f.replace(/\.yml$/, ''),
      dir: path.join(labDir, f.replace(/\.yml$/, '')),
      def: readYaml(path.join(labDir, f)),
    }));
}

/** Interface copy that the engine still reads from content (course, track and UI text). */
function readInterface(dir) {
  const legacyFile = path.join(dir, 'legacy.yml');
  if (!fs.existsSync(legacyFile)) return null;
  const { course, track } = readYaml(legacyFile);
  const optional = (name) => (fs.existsSync(path.join(dir, name)) ? readJson(path.join(dir, name)) : null);
  const home = optional('home.json');
  const progress = optional('progress.json');
  return {
    apiVersion: 1,
    course,
    track,
    interface: {
      ...(optional('interface.json') ?? {}),
      ...(home ? { HomePage: home } : {}),
      ...(progress ? { ProgressPage: progress } : {}),
    },
  };
}

/** The source model the compiler works on: one site and its programs, in site order. */
export function readContent(contentDir, diagnostics) {
  const siteFile = path.join(contentDir, 'site.yml');
  if (!fs.existsSync(siteFile)) {
    diagnostics.error(siteFile, null, 'missing site.yml');
    return { site: { programs: [] }, siteFile, programs: [], home: null, interface: null };
  }
  const site = readYaml(siteFile);
  const programsDir = path.join(contentDir, 'programs');
  const present = fs.existsSync(programsDir) ? fs.readdirSync(programsDir, { withFileTypes: true }).filter((d) => d.isDirectory()) : [];

  const programs = [];
  for (const id of site.programs ?? []) {
    const dir = path.join(programsDir, id);
    if (!fs.existsSync(path.join(dir, 'program.yml'))) {
      diagnostics.error(siteFile, null, `program '${id}' has no programs/${id}/program.yml`);
      continue;
    }
    const detailsFile = path.join(dir, 'details.md');
    programs.push({
      dir,
      id,
      program: readYaml(path.join(dir, 'program.yml')),
      chapters: readChapters(path.join(dir, 'chapters')),
      objectives: readYaml(path.join(dir, 'objectives.yml'), []),
      details: fs.existsSync(detailsFile)
        ? { file: detailsFile, source: fs.readFileSync(detailsFile, 'utf8'), ...readData(detailsFile) }
        : null,
      legacy: readInterface(dir),
      labs: readLabs(dir),
    });
  }
  for (const d of present)
    if (!(site.programs ?? []).includes(d.name))
      diagnostics.warn(path.join(programsDir, d.name), null, `program '${d.name}' is not listed in site.yml and was not built`);
  const homeFile = path.join(contentDir, 'site', 'home.md');
  const interfaceFile = path.join(contentDir, 'interface.json');
  return {
    site,
    siteFile,
    programs,
    home: fs.existsSync(homeFile) ? { file: homeFile, source: fs.readFileSync(homeFile, 'utf8'), ...readData(homeFile) } : null,
    interface: fs.existsSync(interfaceFile) ? { apiVersion: 1, interface: readJson(interfaceFile) } : null,
  };
}
