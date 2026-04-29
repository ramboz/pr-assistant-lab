/**
 * Generate a URL-safe slug from a string. Strips diacritics, lowercases,
 * collapses non-alphanumeric runs to single hyphens, and trims trailing
 * hyphens.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
