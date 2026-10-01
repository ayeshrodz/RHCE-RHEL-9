import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import YAML from 'yaml';
import GithubSlugger from 'github-slugger';
import { readPractice } from '../scripts/read-practice.mjs';
import { readTrack } from '../scripts/read-track.mjs';
const challenges = readPractice();

const processor = createProcessor({ remarkPlugins: [remarkFrontmatter, remarkGfm] });
const objectives = YAML.parse(fs.readFileSync('content/_objectives.yml', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('public/lab/graders.json', 'utf8'));
const objectiveIds = new Set(objectives.map((o) => o.id));
assert.equal(objectiveIds.size, objectives.length, 'Duplicate objective IDs');
const routes = new Map([['/', new Set()], ['/progress', new Set()]]);
const course = YAML.parse(fs.readFileSync('content/_course.yml', 'utf8'));
const track = readTrack('content', course.track);
routes.set(track.platform.path, new Set());
const pages = [], links = [], activityIds = new Set(), labs = new Set();
let questions = 0, tasks = 0;
const literal = (node) => node?.type === 'ArrayExpression' ? node.elements.map(literal) : node?.type === 'TemplateLiteral' ? node.quasis.map((q) => q.value.cooked).join('') : node?.value;
const attr = (node, name) => {
  const value = node.attributes?.find((a) => a.name === name)?.value;
  return value?.type === 'mdxJsxAttributeValueExpression' ? literal(value.data.estree.body[0].expression) : value;
};
const textOf = (node) => node.value ?? (node.children ?? []).map(textOf).join('');
function stable(id, context) {
  assert.match(id ?? '', /^[a-z][a-z0-9-]+$/, `Missing or invalid stable ID: ${context}`);
  assert(!activityIds.has(id), `Duplicate activity ID ${id}`); activityIds.add(id);
}
function validateFlowMap(node, route) {
  const steps = node.attributes.find((a) => a.name === 'steps')?.value?.data?.estree?.body[0]?.expression?.elements;
  assert(steps && steps.length >= 2 && steps.length <= 4, `${route}: FlowMap needs two to four steps`);
  const ids = new Set();
  for (const item of steps) {
    const step = Object.fromEntries(item.properties.map((p) => [p.key.name, literal(p.value)]));
    for (const field of ['id', 'title', 'text']) assert(typeof step[field] === 'string' && step[field].trim(), `${route}: missing diagram ${field}`);
    assert(!ids.has(step.id), `${route}: duplicate diagram step ${step.id}`); ids.add(step.id);
  }
}
for (const dir of fs.readdirSync('content').filter((d) => /^ch\d+/.test(d)).sort()) {
  const chapter = dir.match(/^ch\d+/)[0];
  const meta = YAML.parse(fs.readFileSync(`content/${dir}/_chapter.yml`, 'utf8'));
  assert.equal(meta.objectives.length, meta.objectiveIds.length, `${chapter} objective count`);
  for (const id of meta.objectiveIds) assert(objectiveIds.has(id), `Unknown objective ${id}`);
  routes.set(`/${chapter}`, new Set());
  for (const file of fs.readdirSync(`content/${dir}`).filter((f) => f.endsWith('.mdx')).sort()) {
    const source = fs.readFileSync(`content/${dir}/${file}`, 'utf8');
    const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert(front, `${file}: missing frontmatter`); const data = YAML.parse(front[1]);
    assert(data.title && ['lesson', 'quiz', 'lab', 'summary'].includes(data.kind), `${file}: invalid title or kind`);
    assert(Number.isInteger(data.minutes) && data.minutes > 0 && data.minutes <= 180, `${file}: invalid duration`);
    if (data.draft) continue;
    if (data.kind === 'lab' && !chapter.startsWith('ch00')) {
      assert.match(data.title, /^(Exercise|Assessment): [A-Z]/, `${file}: use Exercise: or Assessment: with sentence case`);
    }
    const slug = data.slug ?? file.replace(/^\d+-/, '').replace(/\.mdx$/, '');
    const route = `/${chapter}/${slug}`;
    assert(!routes.has(route), `Duplicate route ${route}`);
    const headings = new Set(); routes.set(route, headings); pages.push(route);
    const slugger = new GithubSlugger(); const localIds = new Set();
    function visit(node) {
      if (node.type === 'heading') headings.add(slugger.slug(textOf(node)));
      if (node.type === 'link' && node.url.startsWith('#')) links.push([route, node.url]);
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        const href = attr(node, 'href'); if (typeof href === 'string' && href.startsWith('#')) links.push([route, href]);
        if (['Quiz', 'Lab'].includes(node.name)) {
          const id = attr(node, 'id'); assert(id, `${route}: ${node.name} needs an ID`);
          assert(!localIds.has(`${node.name}:${id}`), `${route}: duplicate ${node.name} ID ${id}`); localIds.add(`${node.name}:${id}`);
          const refs = attr(node, 'objectives'); assert(Array.isArray(refs) && refs.length, `${route}: ${node.name} needs objective references`);
          for (const ref of refs) assert(objectiveIds.has(ref), `${route}: unknown objective ${ref}`);
        }
        if (node.name === 'FlowMap') validateFlowMap(node, route);
        if (node.name === 'Reveal') {
          assert((node.children ?? []).some((child) => textOf(child).trim() || child.name), `${route}: empty disclosure ${attr(node, 'title')}`);
        }
        if (node.name === 'LabChallenge') {
          assert(textOf(node).trim().length >= 80 && node.children.some((child) => child.type === 'list' && child.children.length >= 2), `${route}: challenge needs a purpose and explicit requirements`);
          assert(!node.children.some((child) => child.type === 'code'), `${route}: keep solution code in the walkthrough, outside LabChallenge`);
        }
        if (node.name === 'Task') { const id = attr(node, 'id'); stable(id, route); headings.add(id); tasks++; }
        if (node.name === 'Quiz') {
          const expression = node.attributes.find((a) => a.name === 'questions').value.data.estree.body[0].expression;
          for (const item of expression.elements) {
            const q = Object.fromEntries(item.properties.map((p) => [p.key.name, literal(p.value)]));
            stable(q.id, route); headings.add(q.id); questions++;
            assert(typeof q.q === 'string' && q.q.length && Array.isArray(q.options) && q.options.length >= 2, `${route}: malformed question ${q.id}`);
            assert(q.options.every((o) => typeof o === 'string'), `${q.id}: non-text option`);
            assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${q.id}: answer out of range`);
            assert(typeof q.explain === 'string' && q.explain.length, `${q.id}: missing explanation`);
          }
        }
        if (node.name === 'ChapterPractice') for (const c of challenges.filter((c) => c.chapter === attr(node, 'chapter'))) headings.add(`challenge-${c.id}`);
        if (node.name === 'Lab') {
          const command = attr(node, 'classroom');
          if (command) {
            assert.equal(node.children.filter((child) => child.name === 'LabChallenge').length, 1, `${route}: graded lab needs one authored challenge brief`);
            assert.equal(node.children.filter((child) => child.name === 'LabNotes').length, 1, `${route}: graded lab needs authored prerequisites and verification`);
            const name = command.match(/^lab start ([a-z0-9-]+)$/)?.[1]; assert(name, `${route}: invalid lab command`); labs.add(name); assert(catalog.exercises[name], `${name}: no grader`); }
        }
      }
      for (const child of node.children ?? []) visit(child);
    }
    visit(processor.parse(source));
  }
}
// Reference pages share MDX headings and internal links, without adding reading progress.
const referenceSource = fs.readFileSync(`content/${track.platform.contentFile}`, 'utf8');
const referenceSlugger = new GithubSlugger();
function visitReference(node) {
  const route = track.platform.path;
  if (node.type === 'heading') routes.get(route).add(referenceSlugger.slug(textOf(node)));
  if (node.type === 'link' && node.url.startsWith('#')) links.push([route, node.url]);
  if (node.name === 'Reveal') assert(textOf(node).trim(), `${route}: empty disclosure`);
  if (node.name === 'FlowMap') validateFlowMap(node, route);
  for (const child of node.children ?? []) visitReference(child);
}
visitReference(processor.parse(referenceSource));
for (const [source, link] of links) {
  const [route, fragment] = link.startsWith('#/') ? link.slice(1).split('#') : [source, link.slice(1)];
  assert(routes.has(route), `${source}: broken link ${link}`);
  if (fragment) assert(routes.get(route).has(decodeURIComponent(fragment)), `${source}: missing heading in ${link}`);
}
for (const objective of objectives) {
  for (const route of [...objective.lessons, ...objective.labs]) assert(routes.has('/' + route), `${objective.id}: missing page ${route}`);
  for (const id of objective.challenges) assert(challenges.some((c) => c.id === id && c.objective === objective.id), `${objective.id}: mismatched challenge ${id}`);
}
for (const challenge of challenges) {
  for (const field of ['id', 'chapter', 'objective', 'title', 'prompt', 'type', 'explain']) assert(typeof challenge[field] === 'string' && challenge[field].trim(), `Missing challenge ${field}`);
  assert(Array.isArray(challenge.hints) && challenge.hints.length && challenge.hints.every((hint) => typeof hint === 'string' && hint.trim()), `${challenge.id}: empty hints`);
  assert(objectiveIds.has(challenge.objective), `Unknown objective ${challenge.objective}`); stable(challenge.id, 'challenge'); }
const manifests = fs.readdirSync('public/lab').filter((d) => fs.existsSync(`public/lab/${d}/MANIFEST`));
assert.deepEqual([...labs].sort(), manifests.sort(), 'Published labs and manifests differ');
assert.deepEqual(Object.keys(catalog.exercises).sort(), manifests.sort(), 'Graders and manifests differ');
const indexed = fs.readFileSync('public/lab/INDEX', 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/)[0]);
assert.deepEqual(indexed.sort(), manifests.sort(), 'INDEX and manifests differ');
for (const name of manifests) {
  const exercise = catalog.exercises[name]; assert(routes.has(exercise.lesson.slice(1)), `${name}: invalid grader lesson`);
  const manifest = fs.readFileSync(`public/lab/${name}/MANIFEST`, 'utf8'); assert(manifest.startsWith('#'), `${name}: invalid manifest`);
  const destinations = new Set();
  for (let line of manifest.split('\n')) {
    line = line.replace(/#.*/, '').trim(); if (!line) continue;
    const hook = line.startsWith('@'); if (hook) line = line.slice(1);
    const [dest, src = dest] = line.split('=');
    for (const part of [dest, src]) assert(/^[a-zA-Z0-9_./-]+$/.test(part) && !part.startsWith('/') && !part.includes('..'), `${name}: unsafe manifest path ${part}`);
    assert(!destinations.has(dest), `${name}: duplicate destination ${dest}`); destinations.add(dest);
    const target = path.join('public/lab', name, src); assert(fs.existsSync(target), `${name}: missing ${src}`);
    if (hook) assert.equal(spawnSync('bash', ['-n', target]).status, 0, `${target}: invalid Bash`);
    else if (/\.ya?ml$/.test(src) && !exercise.intentionalFaults) YAML.parse(fs.readFileSync(target, 'utf8'));
  }
  for (const cp of Object.values(exercise.checkpoints)) for (const probe of cp.probes) assert(probe.targets?.length, `${name}: probe needs required hosts`);
}
fs.mkdirSync('node_modules/.cache/playbook-path', { recursive: true });
fs.writeFileSync('node_modules/.cache/playbook-path/routes.json', JSON.stringify([...routes.keys()]));
console.log(`Validated ${routes.size} routes, ${questions} questions, ${tasks} tasks, ${challenges.length} challenges, ${objectives.length} objectives and ${manifests.length} starter manifests.`);
