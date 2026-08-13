/** Filename stem from period label, e.g. "Internal medicine" → "internalmedicine-guardias". */
export function guardiasIcsBasename(label: string): string {
  const slug = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 48);
  return `${slug.length > 0 ? slug : 'shifts'}-guardias`;
}
