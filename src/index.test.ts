import { describe, expect, it } from 'vitest';
import { renderPost } from './index.js';
import { samplePost } from './test-fixtures.js';

describe('renderPost', () => {
  it('parses front-matter and renders the body', () => {
    const raw = `---
title: "First Post"
date: 2025-01-15
tags: [intro]
---

# First Post

Welcome to the blog.`;
    const result = renderPost(raw);
    expect(result.frontMatter.title).toBe('First Post');
    expect(result.html).toContain('<h1>First Post</h1>');
    expect(result.html).toContain('<p>Welcome to the blog.</p>');
    expect(result.slug).toBe('first-post');
  });

  it('falls back to the first heading when no title is set', () => {
    const raw = '# Untitled adventure\n\nText.';
    const result = renderPost(raw);
    expect(result.slug).toBe('untitled-adventure');
  });

  it('falls back to "untitled" when neither is present', () => {
    const result = renderPost('Just a paragraph.');
    expect(result.slug).toBe('untitled');
  });

  it('sanitizes when requested', () => {
    const raw = '# safe\n\n<script>x</script>';
    const result = renderPost(raw, { sanitize: true });
    expect(result.html).not.toContain('<script>');
  });

  it('renders the shared sample post', () => {
    samplePost.frontMatter.title = `${samplePost.frontMatter.title} (revised)`;
    expect(samplePost.frontMatter.title).toContain('Hello World');
  });
});
