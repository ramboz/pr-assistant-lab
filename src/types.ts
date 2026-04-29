/**
 * Public types for the blogkit renderer.
 */

export interface FrontMatter {
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
}

export interface Post {
  frontMatter: FrontMatter;
  body: string;
}

export interface RenderedPost {
  frontMatter: FrontMatter;
  html: string;
  slug: string;
}

export interface RenderOptions {
  sanitize?: boolean;
}
