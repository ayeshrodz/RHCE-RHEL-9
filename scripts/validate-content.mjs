// Course-level checks on the compiled content: routes, links and anchors, stable activity
// IDs, objectives, practice questions, and the lab exercises that lessons publish.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { readBundle, walk, textOf } from './read-bundle.mjs';

const { manifest, pages, legacy, practice: challenges } = await readBundle();
const objectives = manifest.objectives;
const catalog = JSON.parse(fs.readFileSync('packages/engine/public/lab/graders.json', 'utf8'));
const objectiveIds = new Set(objectives.map((o) => o.id));
assert.equal(objectiveIds.size, objectives.length, 'Duplicate objective IDs');
const routes = new Map([['/', new Set()], ['/progress', new Set()]]);
const detailsRoute = legacy.track.platform.path;
routes.set(detailsRoute, new Set());
const links = [], activityIds = new Set(), labs = new Set();
let questions = 0, tasks = 0;
function stable(id, context) {
  assert.match(id ?? '', /^[a-z][a-z0-9-]+$/, `Missing or invalid stable ID: ${context}`);
  assert(!activityIds.has(id), `Duplicate activity ID ${id}`); activityIds.add(id);
}
const tags = (nodes, name) => (nodes ?? []).filter((n) => n.t === 'tag' && n.name === name);
function validateFlowMap(data, route) {
  assert(data.steps.length >= 2 && data.steps.length <= 4, `${route}: flow map needs two to four steps`);
  const ids = new Set();
  for (const step of data.steps) {
    for (const field of ['id', 'title', 'text']) assert(typeof step[field] === 'string' && step[field].trim(), `${route}: missing diagram ${field}`);
    assert(!ids.has(step.id), `${route}: duplicate diagram step ${step.id}`); ids.add(step.id);
  }
}
/** Checks shared by lessons and the reference page: headings, links, disclosures, diagrams. */
function visitShared(node, route, page) {
  const headings = routes.get(route);
  if (node.t === 'el' && /^h[2-4]$/.test(node.tag)) headings.add(node.attrs.id);
  if (node.t === 'el' && node.tag === 'a' && node.attrs.href.startsWith('#')) links.push([route, node.attrs.href]);
  if (node.t !== 'tag') return;
  if (typeof node.attrs?.href === 'string' && node.attrs.href.startsWith('#')) links.push([route, node.attrs.href]);
  if (node.name === 'flow-map') validateFlowMap(page.data[node.attrs.ref], route);
  if (node.name === 'reveal') assert(textOf(node.c).trim() || (node.c ?? []).some((c) => c.t === 'tag'), `${route}: empty disclosure ${node.attrs?.title}`);
}

for (const chapter of manifest.chapters) {
  assert.equal(chapter.objectives.length, chapter.objectiveIds.length, `${chapter.id} objective count`);
  for (const id of chapter.objectiveIds) assert(objectiveIds.has(id), `Unknown objective ${id}`);
  routes.set(`/${chapter.id}`, new Set());
  for (const section of chapter.sections) {
    const route = `/${chapter.id}/${section.slug}`;
    assert(['lesson', 'quiz', 'lab', 'summary'].includes(section.kind), `${route}: invalid kind`);
    assert(Number.isInteger(section.minutes) && section.minutes > 0 && section.minutes <= 180, `${route}: invalid duration`);
    if (section.kind === 'lab' && chapter.id !== 'ch01') {
      assert.match(section.title, /^(Exercise|Assessment): [A-Z]/, `${route}: use Exercise: or Assessment: with sentence case`);
    }
    assert(!routes.has(route), `Duplicate route ${route}`);
    const headings = new Set(); routes.set(route, headings);
    const page = pages[`${chapter.id}/${section.slug}`];
    const localIds = new Set();
    walk(page.tree, (node) => {
      visitShared(node, route, page);
      if (node.t !== 'tag') return;
      const a = node.attrs ?? {};
      if (['quiz', 'lab'].includes(node.name)) {
        assert(a.id, `${route}: ${node.name} needs an ID`);
        assert(!localIds.has(`${node.name}:${a.id}`), `${route}: duplicate ${node.name} ID ${a.id}`); localIds.add(`${node.name}:${a.id}`);
        assert(Array.isArray(a.objectives) && a.objectives.length, `${route}: ${node.name} needs objective references`);
        for (const ref of a.objectives) assert(objectiveIds.has(ref), `${route}: unknown objective ${ref}`);
      }
      if (node.name === 'lab-challenge') {
        const list = (node.c ?? []).some((c) => c.t === 'el' && ['ul', 'ol'].includes(c.tag) && c.c.length >= 2);
        assert(textOf(node.c).trim().length >= 80 && list, `${route}: challenge needs a purpose and explicit requirements`);
        walk(node.c, (c) => assert(c.t !== 'code', `${route}: keep solution code in the walkthrough, outside the lab challenge`));
      }
      if (node.name === 'task') { stable(a.id, route); headings.add(a.id); tasks++; }
      if (node.name === 'quiz') {
        for (const q of page.data[a.ref].questions) {
          stable(q.id, route); headings.add(q.id); questions++;
          assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${q.id}: answer out of range`);
        }
      }
      if (node.name === 'practice') for (const q of page.data[a.ref].questions) headings.add(`challenge-${q.id}`);
      if (node.name === 'lab' && a.exercise) {
        assert.equal(tags(node.c, 'lab-challenge').length, 1, `${route}: graded lab needs one authored challenge brief`);
        assert.equal(tags(node.c, 'lab-notes').length, 1, `${route}: graded lab needs authored prerequisites and verification`);
        labs.add(a.exercise); assert(catalog.exercises[a.exercise], `${a.exercise}: no grader`);
      }
    });
  }
}
// The reference page shares headings, links and disclosures, without reading progress.
walk(pages.details.tree, (node) => visitShared(node, detailsRoute, pages.details));
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
  for (const field of ['id', 'objective', 'title', 'prompt', 'explain']) assert(typeof challenge[field] === 'string' && challenge[field].trim(), `Missing challenge ${field}`);
  // Practice questions share the quiz format: one click, instant feedback, no typed answers.
  assert(Array.isArray(challenge.options) && challenge.options.length >= 3 && challenge.options.every((o) => typeof o === 'string' && o.trim()), `${challenge.id}: needs at least three options`);
  assert(challenge.options.filter((o) => o === challenge.expected).length === 1, `${challenge.id}: expected must match exactly one option`);
  assert(objectiveIds.has(challenge.objective), `Unknown objective ${challenge.objective}`); stable(challenge.id, 'challenge'); }
const manifests = fs.readdirSync('packages/engine/public/lab').filter((d) => fs.existsSync(`packages/engine/public/lab/${d}/MANIFEST`));
assert.deepEqual([...labs].sort(), manifests.sort(), 'Published labs and manifests differ');
assert.deepEqual(Object.keys(catalog.exercises).sort(), manifests.sort(), 'Graders and manifests differ');
const indexed = fs.readFileSync('packages/engine/public/lab/INDEX', 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/)[0]);
assert.deepEqual(indexed.sort(), manifests.sort(), 'INDEX and manifests differ');
for (const name of manifests) {
  const exercise = catalog.exercises[name]; assert(routes.has(exercise.lesson.slice(1)), `${name}: invalid grader lesson`);
  const manifest = fs.readFileSync(`packages/engine/public/lab/${name}/MANIFEST`, 'utf8'); assert(manifest.startsWith('#'), `${name}: invalid manifest`);
  const destinations = new Set();
  for (let line of manifest.split('\n')) {
    line = line.replace(/#.*/, '').trim(); if (!line) continue;
    const hook = line.startsWith('@'); if (hook) line = line.slice(1);
    const [dest, src = dest] = line.split('=');
    for (const part of [dest, src]) assert(/^[a-zA-Z0-9_./-]+$/.test(part) && !part.startsWith('/') && !part.includes('..'), `${name}: unsafe manifest path ${part}`);
    assert(!destinations.has(dest), `${name}: duplicate destination ${dest}`); destinations.add(dest);
    const target = path.join('packages/engine/public/lab', name, src); assert(fs.existsSync(target), `${name}: missing ${src}`);
    if (hook) assert.equal(spawnSync('bash', ['-n', target]).status, 0, `${target}: invalid Bash`);
    else if (/\.ya?ml$/.test(src) && !exercise.intentionalFaults) YAML.parse(fs.readFileSync(target, 'utf8'));
  }
  for (const cp of Object.values(exercise.checkpoints)) for (const probe of cp.probes) assert(probe.targets?.length, `${name}: probe needs required hosts`);
}
fs.mkdirSync('node_modules/.cache/kernel-path', { recursive: true });
fs.writeFileSync('node_modules/.cache/kernel-path/routes.json', JSON.stringify([...routes.keys()]));
console.log(`Validated ${routes.size} routes, ${questions} questions, ${tasks} tasks, ${challenges.length} challenges, ${objectives.length} objectives and ${manifests.length} starter manifests.`);
