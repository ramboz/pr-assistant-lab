import { describe, expect, it } from 'vitest';
import { parsePost } from './frontmatter.js';

describe('parsePost', () => {
  it('parses a post with front-matter', () => {
    const raw = `---
title: "Hello World"
date: 2025-04-15
tags: [intro, demo]
draft: false
---

# Welcome

Body text.`;
    const post = parsePost(raw);
    expect(post.frontMatter.title).toBe('Hello World');
    expect(post.frontMatter.date).toBe('2025-04-15');
    expect(post.frontMatter.tags).toEqual(['intro', 'demo']);
    expect(post.frontMatter.draft).toBe(false);
    expect(post.body).toContain('# Welcome');
  });

  it('returns defaults when no front-matter is present', () => {
    const post = parsePost('# Just a heading\n\nNo front-matter here.');
    expect(post.frontMatter.title).toBe('');
    expect(post.frontMatter.tags).toEqual([]);
    expect(post.body).toContain('Just a heading');
  });

  it('throws on unterminated front-matter', () => {
    const raw = `---
title: oops
no closing delimiter`;
    expect(() => parsePost(raw)).toThrow(/Unterminated/);
  });

  it('handles draft flag', () => {
    const raw = `---
title: WIP
draft: true
---
body`;
    expect(parsePost(raw).frontMatter.draft).toBe(true);
  });
});
