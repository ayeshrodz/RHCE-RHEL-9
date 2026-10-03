// `kernel new …`: start a program, chapter, section or lab exercise from a template that already
// passes `kernel validate`, with the next free number where numbering matters.
import fs from 'node:fs';
import path from 'node:path';

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class ScaffoldError extends Error {}

function id(value, what) {
  if (!ID.test(value ?? ''))
    throw new ScaffoldError(`${what} must be lower-case words joined by hyphens (for example "my-topic"), not '${value ?? ''}'`);
  return value;
}

/** A title for a name: "ssh-and-remote-access" → "Ssh and remote access". */
const titleOf = (slug) => {
  const text = slug.replace(/-/g, ' ');
  return text[0].toUpperCase() + text.slice(1);
};

function write(file, text) {
  if (fs.existsSync(file)) throw new ScaffoldError(`${file} already exists; nothing was changed`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return file;
}

function programDir(content, program) {
  const dir = path.join(content, 'programs', id(program, 'the program id'));
  if (!fs.existsSync(path.join(dir, 'program.yml')))
    throw new ScaffoldError(`there is no program '${program}' (programs/${program}/program.yml is missing)`);
  return dir;
}

function nextNumber(names, pattern) {
  return Math.max(0, ...names.map((n) => Number(pattern.exec(n)?.[1] ?? 0))) + 1;
}

const q = (text) => JSON.stringify(text);

/** Returns the files that were created. */
export function scaffold(kind, args, options, content = 'content') {
  const created = [];
  switch (kind) {
    case 'program': {
      const [name] = args;
      id(name, 'the program id');
      const dir = path.join(content, 'programs', name);
      const title = options.title ?? titleOf(name);
      created.push(
        write(
          path.join(dir, 'program.yml'),
          `apiVersion: 1\nid: ${name}\ntitle: ${q(title)}\nlabel: ${q(options.label ?? title.split(' ')[0])}\nsummary: ${q('One or two sentences on what a learner can do after this program.')}\nplatform:\n  family: linux\n  version: "1"\n  label: Linux\nstatus: planned\n`,
        ),
        write(path.join(dir, 'objectives.yml'), '[]\n'),
      );
      fs.mkdirSync(path.join(dir, 'chapters'), { recursive: true });
      const siteFile = path.join(content, 'site.yml');
      const site = fs.readFileSync(siteFile, 'utf8');
      if (!new RegExp(`^\\s+- ${name}\\s*$`, 'm').test(site)) fs.writeFileSync(siteFile, site.replace(/\s*$/, '\n') + `  - ${name}\n`);
      break;
    }
    case 'chapter': {
      const [program, slug] = args;
      const dir = programDir(content, program);
      id(slug, 'the chapter name');
      const chapters = path.join(dir, 'chapters');
      const number = nextNumber(fs.existsSync(chapters) ? fs.readdirSync(chapters) : [], /^ch(\d{2})-/);
      const folder = path.join(chapters, `ch${String(number).padStart(2, '0')}-${slug}`);
      created.push(
        write(
          path.join(folder, '_chapter.yml'),
          `title: ${q(options.title ?? titleOf(slug))}\ngoal: ${q('What the learner will be able to do after this chapter.')}\nstatus: planned\ntopics:\n  - ${q('First topic')}\n`,
        ),
      );
      break;
    }
    case 'section': {
      const [program, chapterNumber, slug] = args;
      const dir = programDir(content, program);
      id(slug, 'the section name');
      const prefix = /^ch\d{2}$/.test(chapterNumber ?? '') ? chapterNumber : `ch${String(Number(chapterNumber)).padStart(2, '0')}`;
      const chapters = path.join(dir, 'chapters');
      const folder = fs.existsSync(chapters) ? fs.readdirSync(chapters).find((n) => n.startsWith(`${prefix}-`)) : null;
      if (!folder) throw new ScaffoldError(`there is no chapter ${prefix} in ${program}`);
      const chapterDir = path.join(chapters, folder);
      const kind = options.kind ?? 'lesson';
      if (!['lesson', 'lab', 'quiz', 'summary'].includes(kind))
        throw new ScaffoldError(`the kind must be lesson, lab, quiz or summary, not '${kind}'`);
      const number = nextNumber(fs.readdirSync(chapterDir), /^(\d{2})-.*\.md$/);
      const title = options.title ?? (kind === 'lab' ? `Exercise: ${titleOf(slug)}` : titleOf(slug));
      const body =
        kind === 'lab'
          ? `{% lead %}\nWhat the learner will build, in a sentence or two.\n{% /lead %}\n\n## The task\n\nExplain the scenario.\n`
          : `{% lead %}\nOne or two sentences on why this matters.\n{% /lead %}\n\n{% objectives %}\n- The first thing the learner will be able to do.\n{% /objectives %}\n\n## First topic\n\nWrite in your own words.\n`;
      // The chapter becomes a real chapter as soon as it has a section.
      const chapterFile = path.join(chapterDir, '_chapter.yml');
      const chapterYaml = fs.readFileSync(chapterFile, 'utf8');
      if (/^status:\s*planned\s*$/m.test(chapterYaml)) fs.writeFileSync(chapterFile, chapterYaml.replace(/^status:\s*planned\s*\n/m, ''));
      created.push(
        write(
          path.join(chapterDir, `${String(number).padStart(2, '0')}-${slug}.md`),
          `---\ntitle: ${q(title)}\nkind: ${kind}\nminutes: 8\n---\n\n${body}`,
        ),
      );
      break;
    }
    case 'lab': {
      const [program, name] = args;
      const dir = programDir(content, program);
      id(name, 'the exercise name');
      const page = options.page;
      if (!/^ch\d{2}\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page ?? ''))
        throw new ScaffoldError('give the section that teaches it, for example --page ch03/lab-inventory');
      created.push(
        write(
          path.join(dir, 'lab', `${name}.yml`),
          `name: ${name}\ntitle: ${q(options.title ?? titleOf(name))}\npage: ${page}\nversion: 1\nstarter: [inventory]\ncheckpoints:\n  final:\n    files: [site.yml]\n    checks:\n      - { id: example, kind: service, on: webservers, targets: [servera.lab.example.com], message: Apache is running and enabled, names: [httpd], active: true, enabled: true }\n`,
        ),
        write(path.join(dir, 'lab', name, 'starter', 'inventory'), '[webservers]\nservera.lab.example.com\n'),
      );
      break;
    }
    default:
      throw new ScaffoldError(
        'use: kernel new program <id> | chapter <program> <name> | section <program> <chapter> <name> | lab <program> <name> --page chNN/slug',
      );
  }
  return created;
}

export { ScaffoldError };
