import { addDays, format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

import type { AppLanguage } from '../../i18n';
import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

const locales = { en: enUS, es } as const;

/** Home header: "August 4th" / "4 de agosto". */
export function formatHomeDateTitle(date: Date, language: AppLanguage): string {
  const locale = locales[language];
  if (language === 'en') {
    return format(date, 'MMMM do', { locale });
  }
  return format(date, "d 'de' MMMM", { locale });
}

/** Next-free-weekend range: "August 6 - 7" / "6 - 7 de agosto". */
export function formatWeekendRange(
  saturdayIso: string,
  language: AppLanguage,
): string {
  const locale = locales[language];
  const saturday = parseCalendarDate(saturdayIso);
  const sunday = addDays(saturday, 1);
  const sameMonth =
    saturday.getMonth() === sunday.getMonth() &&
    saturday.getFullYear() === sunday.getFullYear();

  if (language === 'en') {
    if (sameMonth) {
      return `${format(saturday, 'MMMM d', { locale })} - ${format(sunday, 'd', { locale })}`;
    }
    return `${format(saturday, 'MMMM d', { locale })} - ${format(sunday, 'MMMM d', { locale })}`;
  }

  if (sameMonth) {
    return `${format(saturday, 'd', { locale })} - ${format(sunday, "d 'de' MMMM", { locale })}`;
  }
  return `${format(saturday, "d 'de' MMMM", { locale })} - ${format(sunday, "d 'de' MMMM", { locale })}`;
}

/** Localized weekday name, e.g. "Thursday" / "jueves". */
export function formatWeekdayLong(date: Date, language: AppLanguage): string {
  return format(date, 'EEEE', { locale: locales[language] });
}

/** Monday-first single-letter weekday headers (L M M J V S D / M T W T F S S). */
export function weekdayInitials(language: AppLanguage): string[] {
  const locale = locales[language];
  const monday = new Date(2020, 0, 6);
  return Array.from({ length: 7 }, (_, index) =>
    format(addDays(monday, index), 'EEE', { locale }).charAt(0).toUpperCase(),
  );
}
