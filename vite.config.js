import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeShiki from '@shikijs/rehype';
import { transformerNotationHighlight } from '@shikijs/transformers';
import { fileURLToPath, URL } from 'node:url';
import contentManifest from './plugins/content-manifest.js';

// Copies ```lang title="file.yml"``` metadata onto the <pre> so the
// CodeBlock component can render a filename / language header.
const codeMeta = {
  name: 'code-meta',
  pre(node) {
    const raw = this.options.meta?.__raw ?? '';
    const title = raw.match(/title="([^"]+)"/)?.[1];
    if (title) node.properties['data-title'] = title;
    node.properties['data-lang'] = this.options.lang;
  },
};

// Compile .mdx pages, but leave `?raw` imports (used by search) as plain text.
function mdxPages(options) {
  const plugin = mdx(options);
  return {
    ...plugin,
    enforce: 'pre',
    transform(code, id) {
      if (/[?&]raw\b/.test(id)) return null;
      return plugin.transform.call(this, code, id);
    },
  };
}

export default defineConfig({
  // Relative asset paths + hash routing = works on any GitHub Pages sub-path.
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    contentManifest(),
    mdxPages({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkFrontmatter, remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeShiki,
          {
            themes: { light: 'github-light', dark: 'github-dark' },
            defaultColor: false,
            fallbackLanguage: 'text',
            transformers: [codeMeta, transformerNotationHighlight()],
          },
        ],
      ],
    }),
    react({ include: /\.(jsx|js|mdx)$/ }),
  ],
  server: { host: 'localhost', port: 3000 },
  build: { outDir: 'dist', chunkSizeWarningLimit: 900 },
});
