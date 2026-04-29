import { escapeHtml } from './sanitize.js';

const SAFE_URL_PATTERN = /^(https?:|\/|#|mailto:)/i;
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const LIST_ITEM_PATTERN = /^\s*[-*]\s+(.+)$/;
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const CODE_PATTERN = /`([^`]+)`/g;
const STRONG_PATTERN = /\*\*([^*]+)\*\*/g;
const EM_PATTERN = /\*([^*]+)\*/g;

/**
 * Render a small subset of markdown to HTML. Supports headings, paragraphs,
 * unordered lists, links, inline code, bold, and italic.
 *
 * The output is HTML-escaped at the inline level; HTML in the source is
 * treated as text.
 */
export function renderMarkdown(source: string): string {
  const lines = source.split('\n');
  const blocks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (HEADING_PATTERN.test(line)) {
      blocks.push(renderHeading(line));
      i++;
      continue;
    }
    if (LIST_ITEM_PATTERN.test(line)) {
      const result = renderList(lines, i);
      blocks.push(result.html);
      i = result.next;
      continue;
    }
    const result = renderParagraph(lines, i);
    blocks.push(result.html);
    i = result.next;
  }
  return blocks.join('\n');
}

function renderHeading(line: string): string {
  const match = HEADING_PATTERN.exec(line);
  if (!match) return '';
  const level = match[1].length;
  const content = renderInline(match[2].trim());
  return `<h${level}>${content}</h${level}>`;
}

function renderList(
  lines: string[],
  start: number,
): { html: string; next: number } {
  const items: string[] = [];
  let i = start;
  while (i < lines.length && LIST_ITEM_PATTERN.test(lines[i])) {
    const match = LIST_ITEM_PATTERN.exec(lines[i]);
    if (match) {
      items.push(`<li>${renderInline(match[1])}</li>`);
    }
    i++;
  }
  return { html: `<ul>${items.join('')}</ul>`, next: i };
}

function renderParagraph(
  lines: string[],
  start: number,
): { html: string; next: number } {
  const collected: string[] = [];
  let i = start;
  while (
    i < lines.length &&
    lines[i].trim() &&
    !HEADING_PATTERN.test(lines[i]) &&
    !LIST_ITEM_PATTERN.test(lines[i])
  ) {
    collected.push(lines[i]);
    i++;
  }
  return { html: `<p>${renderInline(collected.join(' '))}</p>`, next: i };
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(CODE_PATTERN, '<code>$1</code>');
  out = out.replace(STRONG_PATTERN, '<strong>$1</strong>');
  out = out.replace(EM_PATTERN, '<em>$1</em>');
  out = out.replace(LINK_PATTERN, (_, linkText: string, href: string) => {
    if (!SAFE_URL_PATTERN.test(href)) {
      return linkText;
    }
    return `<a href="${href}">${linkText}</a>`;
  });
  return out;
}
