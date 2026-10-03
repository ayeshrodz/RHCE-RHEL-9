// @kernel-path/schema: the content contract shared by the compiler, the engine and the lab tools.
// Everything here is data. Engines implement the catalog; content refers to it by tag name only.
import catalog from '../catalog/components.json' with { type: 'json' };
import common from '../schemas/common.schema.json' with { type: 'json' };
import catalogSchema from '../schemas/catalog.schema.json' with { type: 'json' };
import site from '../schemas/source/site.schema.json' with { type: 'json' };
import program from '../schemas/source/program.schema.json' with { type: 'json' };
import chapter from '../schemas/source/chapter.schema.json' with { type: 'json' };
import section from '../schemas/source/section.schema.json' with { type: 'json' };
import objectives from '../schemas/source/objectives.schema.json' with { type: 'json' };
import theme from '../schemas/source/theme.schema.json' with { type: 'json' };
import lab from '../schemas/source/lab.schema.json' with { type: 'json' };
import quiz from '../schemas/data/quiz.schema.json' with { type: 'json' };
import practice from '../schemas/data/practice.schema.json' with { type: 'json' };
import flashcards from '../schemas/data/flashcards.schema.json' with { type: 'json' };
import flowMap from '../schemas/data/flow-map.schema.json' with { type: 'json' };
import diagram from '../schemas/data/diagram.schema.json' with { type: 'json' };
import featureGrid from '../schemas/data/feature-grid.schema.json' with { type: 'json' };
import terminalDemo from '../schemas/data/terminal-demo.schema.json' with { type: 'json' };
import fs from 'node:fs';
import bundleSite from '../schemas/bundle/site.schema.json' with { type: 'json' };
import bundleManifest from '../schemas/bundle/manifest.schema.json' with { type: 'json' };
import bundlePage from '../schemas/bundle/page.schema.json' with { type: 'json' };
import bundleSearch from '../schemas/bundle/search.schema.json' with { type: 'json' };
import bundleInterface from '../schemas/bundle/interface.schema.json' with { type: 'json' };
import bundleLegacy from '../schemas/bundle/legacy.schema.json' with { type: 'json' };

// One data schema per kit, discovered from the catalog so adding a kit needs no edit here.
const kitSchemas = Object.entries(catalog.components)
  .filter(([, c]) => c.kit)
  .map(([, c]) => JSON.parse(fs.readFileSync(new URL(`../schemas/${c.data}`, import.meta.url), 'utf8')));

// A compiled page may only use tags the catalog offers (not the planned ones, which cannot be rendered yet).
const pageSchema = structuredClone(bundlePage);
pageSchema.$defs.tag.properties.name = {
  type: 'string',
  enum: Object.entries(catalog.components)
    .filter(([, c]) => c.status !== 'planned')
    .map(([name]) => name),
};

/** The contract version this package describes. */
export const API_VERSION = 1;

/** Every schema, for registering with a validator. Each carries a unique $id. */
export const schemas = [
  common,
  catalogSchema,
  theme,
  site,
  program,
  chapter,
  section,
  objectives,
  lab,
  quiz,
  practice,
  flashcards,
  flowMap,
  diagram,
  featureGrid,
  terminalDemo,
  ...kitSchemas,
  bundleSite,
  bundleManifest,
  pageSchema,
  bundleSearch,
  bundleInterface,
  bundleLegacy,
];

/** Schema $ids by role, so callers never hard-code URLs. */
export const schemaIds = {
  site: site.$id,
  program: program.$id,
  chapter: chapter.$id,
  section: section.$id,
  objectives: objectives.$id,
  theme: theme.$id,
  lab: lab.$id,
  catalog: catalogSchema.$id,
  bundle: {
    site: bundleSite.$id,
    manifest: bundleManifest.$id,
    page: pageSchema.$id,
    search: bundleSearch.$id,
    legacy: bundleLegacy.$id,
    interface: bundleInterface.$id,
  },
};

/** The component catalog: tag name → typed description. */
export { catalog };

/**
 * What the browser needs to check a tag's attributes before rendering it: for each usable tag, its
 * attributes with their types, allowed values and limits, and which are required.
 */
export function tagTable() {
  return Object.fromEntries(
    Object.entries(catalog.components)
      .filter(([, c]) => c.status !== 'planned')
      .map(([name, c]) => [
        name,
        {
          required: c.required ?? [],
          ...(c.kit ? { kit: true } : {}),
          attributes: Object.fromEntries(
            Object.entries(c.attributes ?? {}).map(([attribute, a]) => [
              attribute,
              Object.fromEntries(
                Object.entries({ type: a.type, enum: a.enum, minimum: a.minimum, maximum: a.maximum, maxItems: a.maxItems }).filter(
                  ([, v]) => v !== undefined,
                ),
              ),
            ]),
          ),
        },
      ]),
  );
}

/** Tags content may use today: stable entries plus legacy entries during the migration. */
export function usableTags() {
  return Object.entries(catalog.components)
    .filter(([, c]) => c.status !== 'planned')
    .map(([name]) => name);
}

/** The data schema $id a tag's `ref` must satisfy, or null. */
export function dataSchemaFor(tag) {
  const file = catalog.components[tag]?.data;
  return file ? new URL(file, common.$id).href : null;
}
