import { parsePost } from './frontmatter.js';
import { renderMarkdown } from './markdown.js';
import { sanitizeHtml } from './sanitize.js';
import { slugify } from './slug.js';
import type { RenderedPost, RenderOptions } from './types.js';

export type { FrontMatter, Post, RenderedPost, RenderOptions } from './types.js';
export { parsePost } from './frontmatter.js';
export { renderMarkdown } from './markdown.js';
export { sanitizeHtml, escapeHtml } from './sanitize.js';
export { slugify } from './slug.js';

/**
 * Parse a markdown source (with optional front-matter), render the body to
 * HTML, and derive a URL slug from the front-matter title or the first
 * heading.
 */
export function renderPost(source: string, options: RenderOptions = {}): RenderedPost {
  const { frontMatter, body } = parsePost(source);
  let html = renderMarkdown(body);
  if (options.sanitize) {
    html = sanitizeHtml(html);
  }
  const slugSource = frontMatter.title || extractFirstHeading(body) || 'untitled';
  return {
    frontMatter,
    html,
    slug: slugify(slugSource),
  };
}

function extractFirstHeading(body: string): string | null {
  const match = /^#{1,6}\s+(.+)$/m.exec(body);
  return match ? match[1].trim() : null;
}
