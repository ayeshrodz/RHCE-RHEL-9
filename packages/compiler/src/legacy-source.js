// Reads the pre-apiVersion-1 content layout (content/chNN-*/ with MDX sections, one course)
// as a single program. Values that later live in programs/<id>/program.yml are derived
// here from today's files. Removed when content moves to programs/ (phase 5).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export const LEGACY_PROGRAM_ID = 'rhel9-ansible';

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/** Reader variables that the engine substitutes into code (from src/lib/placeholders.jsx). */
const READER_VARIABLES = [
  { key: 'HOST_LAN_IP', label: "Host's LAN IP", hint: 'hostname -I on the host', example: '192.168.1.50', pattern: 'ipv4' },
  { key: 'HOST_USER', label: 'Your user on the host', hint: 'whoami on the host', example: 'alex', pattern: 'username' },
  { key: 'ROUTER_IP', label: 'Your router (default gateway)', hint: 'ip route | grep default', example: '192.168.1.1', pattern: 'ipv4' },
];

const readYaml = (file) => (fs.existsSync(file) ? (YAML.parse(fs.readFileSync(file, 'utf8')) ?? {}) : {});

function inferKind(slug) {
  if (/(^|-)lab(-|$)/.test(slug)) return 'lab';
  if (/quiz/.test(slug)) return 'quiz';
  if (/summary/.test(slug)) return 'summary';
  return 'lesson';
}

/** Reading time, computed exactly as the current site does. */
function estimateMinutes(source) {
  const body = source.replace(FRONTMATTER, '').replace(/^export const (?:widgetContent|practice) = [[{][\s\S]*?^[\]}];\s*$/gm, '');
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(3, Math.round(words / 180));
}

/** The source model the compiler works on: one site and its programs. */
export function readLegacyContent(contentDir) {
  const course = readYaml(path.join(contentDir, '_course.yml'));
  const track = readYaml(path.join(contentDir, 'tracks', course.track, '_track.yml'));
  const home = JSON.parse(fs.readFileSync(path.join(contentDir, 'home.json'), 'utf8'));

  const chapters = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^ch\d{2}-/.test(d.name))
    .map((d) => d.name)
    .sort()
    .map((dir) => {
      const chapterDir = path.join(contentDir, dir);
      const id = dir.slice(0, 4);
      const meta = readYaml(path.join(chapterDir, '_chapter.yml'));
      const sections = fs
        .readdirSync(chapterDir)
        .filter((f) => f.endsWith('.mdx'))
        .sort()
        .map((name) => {
          const file = path.join(chapterDir, name);
          const source = fs.readFileSync(file, 'utf8');
          const front = YAML.parse(source.match(FRONTMATTER)?.[0].replace(/^---\r?\n|\r?\n---\r?\n?$/g, '') ?? '') ?? {};
          const base = name.replace(/\.mdx$/, '');
          const slug = front.slug ?? base.replace(/^\d+-/, '');
          return { file, source, front, slug, kind: front.kind ?? inferKind(slug), minutes: front.minutes ?? estimateMinutes(source) };
        })
        .filter((s) => s.front.draft !== true);
      return { id, dir: chapterDir, meta, number: meta.number ?? Number(id.slice(2)), sections };
    });

  const detailsFile = path.join(contentDir, 'tracks', course.track, track.platform);
  const program = {
    apiVersion: 1,
    id: LEGACY_PROGRAM_ID,
    title: `Ansible automation on ${track.label}`,
    label: 'Ansible',
    tagline: course.tagline,
    summary: home.text.heroSub,
    platform: { family: 'rhel', version: String(track.rhel), label: track.label },
    status: 'active',
    stages: home.data.stages,
    variants: [
      { id: 'classroom', label: 'Classroom', icon: 'school' },
      { id: 'homelab', label: 'Home lab', icon: 'house', default: true },
    ],
    readerVariables: READER_VARIABLES,
    lab: true,
  };

  const detailsFront = YAML.parse(
    fs
      .readFileSync(detailsFile, 'utf8')
      .match(FRONTMATTER)[0]
      .replace(/^---\r?\n|\r?\n---\r?\n?$/g, ''),
  );
  const readJson = (name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), 'utf8'));
  const legacy = {
    apiVersion: 1,
    course: { title: course.title, tagline: course.tagline, ...(course.repo ? { repo: course.repo } : {}) },
    track: {
      ...Object.fromEntries(
        Object.entries(track)
          .filter(([key]) => key !== 'platform')
          .map(([key, value]) => [key, String(value)]),
      ),
      platform: { title: detailsFront.title, eyebrow: detailsFront.eyebrow, description: detailsFront.description, path: '/platform' },
    },
    interface: { ...readJson('_interface.json'), HomePage: home, ProgressPage: readJson('progress.json') },
  };

  return {
    site: { apiVersion: 1, name: course.title, tagline: course.tagline, repo: course.repo, programs: [LEGACY_PROGRAM_ID] },
    programs: [
      {
        program,
        chapters,
        objectives: readYaml(path.join(contentDir, '_objectives.yml')),
        details: { file: detailsFile, source: fs.readFileSync(detailsFile, 'utf8') },
        legacy,
      },
    ],
  };
}
