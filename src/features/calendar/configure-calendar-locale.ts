import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { LocaleConfig } from 'react-native-calendars';

import { weekdayInitials } from '../dashboard/format-home-copy';
import type { AppLanguage } from '../../i18n';

const dateFnsLocales = { en: enUS, es } as const;

/**
 * Registers en/es month + weekday names for `react-native-calendars`
 * and selects the active locale.
 */
export function configureCalendarLocale(
  language: AppLanguage,
  todayLabel: string,
): void {
  const locale = dateFnsLocales[language];

  const monthNames = Array.from({ length: 12 }, (_, month) =>
    format(new Date(2020, month, 1), 'MMMM', { locale }),
  );
  const monthNamesShort = Array.from({ length: 12 }, (_, month) =>
    format(new Date(2020, month, 1), 'MMM', { locale }),
  );
  const mondayFirstLetters = weekdayInitials(language);
  const dayNamesShort = [
    mondayFirstLetters[6]!,
    ...mondayFirstLetters.slice(0, 6),
  ];
  const dayNames = dayNamesShort;

  // `today` is read at runtime; the published locale_detail type omits it.
  LocaleConfig.locales[language] = {
    monthNames,
    monthNamesShort,
    dayNames,
    dayNamesShort,
    today: todayLabel,
  } as (typeof LocaleConfig.locales)[string];
  LocaleConfig.defaultLocale = language;
}
