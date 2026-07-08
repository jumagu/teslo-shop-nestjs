/**
 * Converts a string (e.g. a product name) into a URL-friendly slug.
 * Uses "-" as the canonical separator (recommended for URLs / SEO).
 * The function is idempotent: running it on an existing slug returns the same slug.
 *
 * @param str - The raw string to slugify.
 * @returns The slugified string.
 */
export function slugify(str: string): string {
  return (
    str
      .toLowerCase()
      // Split accented characters into base letter + diacritic mark
      .normalize('NFD')
      // Remove the diacritic marks (e.g. "é" -> "e", "ñ" -> "n")
      .replaceAll(/[\u0300-\u036f]/g, '')
      // Remove anything that isn't a letter, number, space, underscore or hyphen
      .replaceAll(/[^a-z0-9\s_-]/g, '')
      // Collapse any run of spaces, underscores or hyphens into a single hyphen
      .replaceAll(/[\s_-]+/g, '-')
      // Trim leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
}
