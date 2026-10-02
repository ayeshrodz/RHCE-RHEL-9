// Loads the compiled content bundle. Content is untrusted input: every file is fetched
// from the configured content base only, and validated against the contract before use.
import {
  validateDiagramData,
  validateFlashcardsData,
  validateFlowMapData,
  validateInterface,
  validateLegacy,
  validateLegacyWidgetData,
  validateManifest,
  validatePage,
  validatePracticeData,
  validateQuizData,
  validateSearch,
  validateSite,
} from '@kernel-path/schema/validators';

export const API_VERSION = 1;

const DATA_VALIDATORS = {
  quiz: validateQuizData,
  practice: validatePracticeData,
  flashcards: validateFlashcardsData,
  'flow-map': validateFlowMapData,
  diagram: validateDiagramData,
  'legacy-widget': validateLegacyWidgetData,
};

export class ContentError extends Error {}

let base = null;
const cache = new Map();

/** Read the deploy-time configuration that says where the content bundle lives. */
async function contentBase() {
  if (base) return base;
  let configured = './content/';
  try {
    const response = await fetch('./kernel.config.json', { cache: 'no-cache' });
    if (response.ok) {
      const config = await response.json();
      if (typeof config.contentBase === 'string') configured = config.contentBase;
    }
  } catch {
    /* no config: use the same-origin default */
  }
  const url = new URL(configured, document.baseURI);
  if (!['https:', 'http:'].includes(url.protocol)) throw new ContentError('The content location must be an http(s) URL.');
  base = url.href.endsWith('/') ? url.href : `${url.href}/`;
  return base;
}

/** Bundle paths are relative and may not leave the content base. */
function resolve(root, file) {
  if (typeof file !== 'string' || file.startsWith('/') || file.includes('..') || /^[a-z]+:/i.test(file)) {
    throw new ContentError(`Refusing to load ${JSON.stringify(file)} from outside the content bundle.`);
  }
  return new URL(file, root).href;
}

function describe(validate) {
  const first = validate.errors?.[0];
  return first ? `${first.instancePath || '(root)'} ${first.message}` : 'invalid';
}

async function load(file, validate, what, { fresh = false } = {}) {
  const root = await contentBase();
  const url = resolve(root, file);
  if (cache.has(url)) return cache.get(url);
  const promise = (async () => {
    const response = await fetch(url, fresh ? { cache: 'no-cache' } : undefined);
    if (!response.ok) throw new ContentError(`Could not load ${what} (${response.status}).`);
    const value = await response.json();
    if (value?.apiVersion !== API_VERSION)
      throw new ContentError(`The ${what} uses content version ${value?.apiVersion}, which this site does not support.`);
    if (!validate(value)) throw new ContentError(`The ${what} is not valid content: ${describe(validate)}.`);
    return value;
  })();
  cache.set(url, promise);
  promise.catch(() => cache.delete(url));
  return promise;
}

/** Tags whose page data must be checked against their data schema before rendering. */
function validatePageData(page) {
  (function visit(nodes) {
    for (const node of nodes ?? []) {
      if (node.t === 'tag' && node.attrs?.ref !== undefined) {
        const validate = DATA_VALIDATORS[node.name];
        const entry = page.data[node.attrs.ref];
        if (!validate || entry === undefined || !validate(entry))
          throw new ContentError(
            `The page data for ${node.name} '${node.attrs.ref}' is not valid${validate ? `: ${describe(validate)}` : ''}.`,
          );
      }
      visit(node.c);
    }
  })(page.tree);
  return page;
}

export const loadSite = () => load('site.json', validateSite, 'site index', { fresh: true });
export const loadManifest = (file) => load(file, validateManifest, 'program manifest');
export const loadInterface = (file) => load(file, validateInterface, 'shared interface copy');
export const loadLegacy = (file) => load(file, validateLegacy, 'interface copy');
export const loadSearch = (file) => load(file, validateSearch, 'search index');
export const loadPage = async (file) => validatePageData(await load(file, validatePage, 'page'));
