import { addMonths, format, parseISO, subDays } from 'date-fns';
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

/** Local calendar date as ISO `YYYY-MM-DD` (no time / timezone shift). */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Inclusive end of a typical rotation: start + 2 months − 1 day. */
export function defaultRotationEndISO(start: Date): string {
  return toISODate(subDays(addMonths(start, 2), 1));
}

/** Formats an ISO date for the add/edit form, e.g. "Jul 1, 2026". */
export function formatFormDate(isoDate: string, language: 'en' | 'es'): string {
  return format(parseISO(isoDate), 'MMM d, yyyy', { locale: locales[language] });
}

/** `HH:mm` from a Date (local). */
export function toHHMM(date: Date): string {
  return format(date, 'HH:mm');
}

/** Build a Date for the time picker from `HH:mm`. */
export function parseHHMM(hhmm: string): Date {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}
