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

/**
 * Human-readable PNG name for the share sheet, e.g. "Quirófano" →
 * "Mi Guardia — Quirófano.png".
 */
export function guardiasImageFilename(label: string): string {
  const cleaned = label
    .normalize('NFC')
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 48);
  const name = cleaned.length > 0 ? cleaned : 'Rotación';
  return `Mi Guardia — ${name}.png`;
}
