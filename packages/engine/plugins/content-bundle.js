// Dev server only: compiles content/ with the content compiler, serves the bundle at
// /content/ from memory, and reloads the page when content changes. Production builds
// write the same bundle with `kernel build` (see the build script); the engine itself
// never imports content.
import path from 'node:path';
import { compile } from '@kernel-path/compiler';

export default function contentBundle({ dir = 'content' } = {}) {
  let contentDir;
  let files = new Map();
  let queued = null;

  async function rebuild(logger) {
    const started = performance.now();
    try {
      const result = await compile(contentDir);
      files = result.files;
      logger.info(`content compiled: ${result.stats.pages} pages in ${Math.round(performance.now() - started)} ms`, { timestamp: true });
      return true;
    } catch (error) {
      // Keep serving the last good bundle; show every content error in the terminal.
      logger.error(error.message, { timestamp: true });
      return false;
    }
  }

  return {
    name: 'content-bundle',
    apply: 'serve',
    configResolved(config) {
      contentDir = path.resolve(config.root, dir);
    },
    async configureServer(server) {
      await rebuild(server.config.logger);
      server.watcher.add(contentDir);
      const onChange = (file) => {
        if (!file.startsWith(contentDir)) return;
        queued ??= Promise.resolve().then(async () => {
          queued = null;
          if (await rebuild(server.config.logger)) server.ws.send({ type: 'full-reload' });
        });
      };
      for (const event of ['add', 'change', 'unlink']) server.watcher.on(event, onChange);
      server.middlewares.use('/content', (req, res, next) => {
        const key = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
        const body = files.get(key);
        if (body === undefined) return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(body);
      });
      // The lab tree (starter files, the lab command and its tools) is published at the site root.
      server.middlewares.use('/lab', (req, res, next) => {
        const key = 'lab/' + decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
        const body = files.get(key);
        if (body === undefined) return next();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(body);
      });
    },
  };
}
