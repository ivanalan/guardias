import { format, parseISO } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

const locales = { en: enUS, es } as const;

/** Formats a rotation date range for the list row, e.g. "Jul 1 – Sep 30". */
export function formatPeriodRange(
  startDate: string,
  endDate: string,
  language: 'en' | 'es',
): string {
  const locale = locales[language];
  const start = format(parseISO(startDate), 'MMM d', { locale });
  const end = format(parseISO(endDate), 'MMM d', { locale });
  return `${start} – ${end}`;
}
