import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

const locales = { en: enUS, es } as const;

/** Clock time only, e.g. "07:00". */
export function formatShiftTime(date: Date): string {
  return format(date, 'HH:mm');
}

/** Short calendar day for shift bounds, e.g. "Jul 2". */
export function formatShiftShortDate(
  date: Date,
  language: 'en' | 'es',
): string {
  return format(date, 'MMM d', { locale: locales[language] });
}

/** Day sheet title without year, e.g. "Thursday, August 27". */
export function formatDaySheetDate(
  isoDate: string,
  language: 'en' | 'es',
): string {
  return format(parseCalendarDate(isoDate), 'EEEE, MMMM d', {
    locale: locales[language],
  });
}
