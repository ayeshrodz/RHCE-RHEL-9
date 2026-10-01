// Shared build/test reader. MDX owns the activity wording and grading data.
import fs from 'node:fs';
import path from 'node:path';
import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
const parser = createProcessor({ remarkPlugins: [remarkFrontmatter, remarkGfm] });
export function readPractice(dir = 'content') {
  const activities = [];
  for (const chapter of fs.readdirSync(dir).filter((d) => /^ch\d+/.test(d)).sort()) {
    for (const file of fs.readdirSync(path.join(dir, chapter)).filter((f) => f.endsWith('.mdx')).sort()) {
      const source = fs.readFileSync(path.join(dir, chapter, file), 'utf8');
      if (!source.includes('export const practice = ')) continue;
      const declaration = parser.parse(source).children.find((node) => node.type === 'mdxjsEsm' && node.value.startsWith('export const practice = '));
      if (!declaration) throw new Error(`${file}: missing practice export`);
      const practice = JSON.parse(declaration.value.slice('export const practice = '.length).trim().replace(/;$/, ''));
      if (!Array.isArray(practice) || practice.some((c) => c.chapter !== chapter.slice(0, 4))) throw new Error(`${file}: practice must be an array for this chapter`);
      activities.push(...practice);
    }
  }
  return activities;
}
