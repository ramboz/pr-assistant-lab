const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape HTML-special characters in a string. Use before interpolating
 * untrusted text into HTML.
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

const ALLOWED_TAGS = new Set([
  'p',
  'a',
  'em',
  'strong',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'br',
  'hr',
  'blockquote',
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href']),
};

const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
const ATTR_PATTERN = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"/g;

/**
 * Strip HTML tags not in the allow-list. For allowed tags, drop attributes
 * not in the per-tag allow-list. Best-effort: not a substitute for a full
 * parser-based sanitizer in production.
 */
export function sanitizeHtml(html: string): string {
  return html.replace(TAG_PATTERN, (match, tagName: string, attrs: string) => {
    const lowered = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lowered)) {
      return '';
    }
    if (match.startsWith('</')) {
      return `</${lowered}>`;
    }
    const cleaned = filterAttributes(lowered, attrs);
    return `<${lowered}${cleaned}>`;
  });
}

function filterAttributes(tag: string, attrs: string): string {
  const allowed = ALLOWED_ATTRIBUTES[tag];
  if (!allowed) return '';
  const found: string[] = [];
  let match: RegExpExecArray | null;
  ATTR_PATTERN.lastIndex = 0;
  while ((match = ATTR_PATTERN.exec(attrs)) !== null) {
    const name = match[1].toLowerCase();
    if (allowed.has(name)) {
      found.push(`${name}="${match[2]}"`);
    }
  }
  return found.length > 0 ? ` ${found.join(' ')}` : '';
}
