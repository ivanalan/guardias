import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

const locales = { en: enUS, es } as const;

/** Local date + time for the day sheet, e.g. "Jul 1, 2026 · 07:00". */
export function formatShiftDateTime(
  date: Date,
  language: 'en' | 'es',
): string {
  return format(date, 'MMM d, yyyy · HH:mm', { locale: locales[language] });
}
