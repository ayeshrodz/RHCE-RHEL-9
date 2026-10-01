import path from 'node:path';
import { readPractice } from '../scripts/read-practice.mjs';
const id = 'virtual:challenges';
const resolved = '\0' + id;
export default function practiceManifest() {
  let root;
  return {
    name: 'practice-manifest',
    configResolved(config) {
      root = config.root;
    },
    resolveId(source) {
      if (source === id) return resolved;
    },
    load(source) {
      if (source === resolved) return `export const challenges = ${JSON.stringify(readPractice(path.join(root, 'content')))};`;
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.startsWith(path.join(root, 'content') + path.sep) || !ctx.file.endsWith('.mdx')) return;
      const module = ctx.server.moduleGraph.getModuleById(resolved);
      if (module) ctx.server.moduleGraph.invalidateModule(module);
      // The dashboard and lesson must receive the same edited definitions.
      ctx.server.ws.send({ type: 'full-reload' });
    },
  };
}
