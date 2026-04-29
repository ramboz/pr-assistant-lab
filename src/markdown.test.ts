import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown.js';

describe('renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# Hello')).toBe('<h1>Hello</h1>');
    expect(renderMarkdown('### Sub')).toBe('<h3>Sub</h3>');
  });

  it('renders paragraphs', () => {
    expect(renderMarkdown('Just some text.')).toBe('<p>Just some text.</p>');
  });

  it('renders unordered lists', () => {
    const md = '- one\n- two\n- three';
    expect(renderMarkdown(md)).toBe('<ul><li>one</li><li>two</li><li>three</li></ul>');
  });

  it('renders bold and italic', () => {
    expect(renderMarkdown('**bold** and *italic*')).toBe(
      '<p><strong>bold</strong> and <em>italic</em></p>',
    );
  });

  it('renders inline code', () => {
    expect(renderMarkdown('Use `npm test`')).toBe('<p>Use <code>npm test</code></p>');
  });

  it('renders safe links', () => {
    expect(renderMarkdown('[home](/index.html)')).toBe(
      '<p><a href="/index.html">home</a></p>',
    );
    expect(renderMarkdown('[anthropic](https://anthropic.com)')).toBe(
      '<p><a href="https://anthropic.com">anthropic</a></p>',
    );
  });

  it('strips unsafe link schemes', () => {
    expect(renderMarkdown('[click](javascript:hi)')).toBe('<p>click</p>');
    expect(renderMarkdown('[bad](data:text/html,evil)')).toBe('<p>bad</p>');
  });

  it('escapes HTML in source', () => {
    expect(renderMarkdown('a <script>x</script> b')).toContain('&lt;script&gt;');
  });
});
