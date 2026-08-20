import { addBusinessDays, addMonths, format, parseISO, subDays } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

const locales = { en: enUS, es } as const;

/** Inclusive weekday count for a default vacation block (Mon–Fri). */
const DEFAULT_VACATION_WEEKDAYS = 10;

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

/**
 * Inclusive end of a default vacation block: `DEFAULT_VACATION_WEEKDAYS`
 * weekdays including the start day (weekends skipped).
 */
export function defaultVacationEndISO(start: Date): string {
  return toISODate(addBusinessDays(start, DEFAULT_VACATION_WEEKDAYS - 1));
}

/**
 * Default vacation end clamped to the rotation period end (`YYYY-MM-DD`).
 * Vacation must stay within the rotation bounds.
 */
export function defaultVacationEndWithinPeriod(
  vacationStartISO: string,
  periodEndISO: string,
): string {
  const proposed = defaultVacationEndISO(parseISO(vacationStartISO));
  return proposed > periodEndISO ? periodEndISO : proposed;
}

/** Formats an ISO date for the add/edit form, e.g. "June 1". */
export function formatFormDate(isoDate: string, language: 'en' | 'es'): string {
  return format(parseISO(isoDate), 'MMMM d', { locale: locales[language] });
}

/** Formats stored `HH:mm` for the form, e.g. "7:00 AM". */
export function formatFormTime(hhmm: string, language: 'en' | 'es'): string {
  return format(parseHHMM(hhmm), 'h:mm a', { locale: locales[language] });
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
