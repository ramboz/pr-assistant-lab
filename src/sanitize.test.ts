import { describe, expect, it } from 'vitest';
import { escapeHtml, sanitizeHtml } from './sanitize.js';

describe('escapeHtml', () => {
  it('escapes the five HTML-special characters', () => {
    expect(escapeHtml('<a href="x" onclick=\'y\'>&</a>')).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('passes through plain text', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('sanitizeHtml', () => {
  it('keeps allowed tags', () => {
    expect(sanitizeHtml('<p>hello</p>')).toBe('<p>hello</p>');
    expect(sanitizeHtml('<strong>bold</strong>')).toBe('<strong>bold</strong>');
  });

  it('strips disallowed tags', () => {
    expect(sanitizeHtml('<script>evil()</script>')).toBe('evil()');
    expect(sanitizeHtml('<p>ok <iframe src="x"></iframe> end</p>')).toBe('<p>ok  end</p>');
  });

  it('keeps href on anchors, drops other attributes', () => {
    expect(sanitizeHtml('<a href="/foo" onclick="bad()">x</a>')).toBe(
      '<a href="/foo">x</a>',
    );
  });

  it('drops attributes from non-anchor tags', () => {
    expect(sanitizeHtml('<p class="evil" id="x">ok</p>')).toBe('<p>ok</p>');
  });
});
