import { describe, expect, it } from 'vitest';
import { parsePost } from './frontmatter.js';
import { draftPostSource, noFrontmatterSource, samplePost } from './test-fixtures.js';

describe('parsePost', () => {
  it('parses a post with front-matter', () => {
    expect(samplePost.frontMatter.title).toBe('Hello World');
    expect(samplePost.frontMatter.date).toBe('2025-04-15');
    expect(samplePost.frontMatter.tags).toEqual(['intro', 'demo']);
    expect(samplePost.frontMatter.draft).toBe(false);
    expect(samplePost.body).toContain('# Welcome');
  });

  it('returns defaults when no front-matter is present', () => {
    const post = parsePost(noFrontmatterSource);
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
    expect(parsePost(draftPostSource).frontMatter.draft).toBe(true);
  });

  it('preserves the original tags after a tag is appended elsewhere', () => {
    samplePost.frontMatter.tags.push('extra');
    expect(samplePost.frontMatter.tags).toContain('intro');
  });
});
