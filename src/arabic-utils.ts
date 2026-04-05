/**
 * Dibuat oleh Ibrahim Nurul Huda
 * Website: sarbeh.com
 * https://academy.founderplus.id/p/turath-plugin
 */

export function normalizeArabicSearchTerm(searchTerm: string): string[] {
  if (!searchTerm) return [];

  const patterns = [`%${searchTerm}%`];
  const words = searchTerm.trim().split(/\s+/);

  for (const w of words) {
    if (w.length >= 2) patterns.push(`%${w}%`);
  }

  if (!searchTerm.startsWith("ال")) {
    patterns.push(`%ال${searchTerm}%`);
    for (const w of words) {
      if (w.length >= 2 && !w.startsWith("ال")) {
        patterns.push(`%ال${w}%`);
      }
    }
  }

  return patterns;
}
