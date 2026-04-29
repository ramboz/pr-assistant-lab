import type { FrontMatter, Post } from './types.js';

const DELIMITER = '---';

/**
 * Parse a markdown post with optional YAML-ish front-matter at the top.
 * Returns the parsed front-matter and the remaining body.
 */
export function parsePost(raw: string): Post {
  const lines = raw.split('\n');
  if (lines[0]?.trim() !== DELIMITER) {
    return {
      frontMatter: defaultFrontMatter(),
      body: raw,
    };
  }

  let endLine = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === DELIMITER) {
      endLine = i;
      break;
    }
  }
  if (endLine === -1) {
    throw new Error('Unterminated front-matter block');
  }

  const fmLines = lines.slice(1, endLine);
  const body = lines.slice(endLine + 1).join('\n');
  return {
    frontMatter: parseFrontMatter(fmLines),
    body: body.replace(/^\n+/, ''),
  };
}

function parseFrontMatter(lines: string[]): FrontMatter {
  const fm = defaultFrontMatter();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    switch (key) {
      case 'title':
        fm.title = unquote(value);
        break;
      case 'date':
        fm.date = unquote(value);
        break;
      case 'tags':
        fm.tags = parseTagList(value);
        break;
      case 'draft':
        fm.draft = value === 'true';
        break;
    }
  }
  return fm;
}

function defaultFrontMatter(): FrontMatter {
  return { title: '', date: '', tags: [], draft: false };
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseTagList(value: string): string[] {
  if (!value.startsWith('[') || !value.endsWith(']')) {
    return [];
  }
  return value
    .slice(1, -1)
    .split(',')
    .map((tag) => unquote(tag.trim()))
    .filter((tag) => tag.length > 0);
}
