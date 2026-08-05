import { addDays, format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { LocaleConfig } from 'react-native-calendars';

import type { AppLanguage } from '../../i18n';

const dateFnsLocales = { en: enUS, es } as const;

/** Sunday … Saturday reference week (2020-01-05 was a Sunday). */
const SUNDAY = new Date(2020, 0, 5);

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
  const dayNames = Array.from({ length: 7 }, (_, day) =>
    format(addDays(SUNDAY, day), 'EEEE', { locale }),
  );
  const dayNamesShort = Array.from({ length: 7 }, (_, day) =>
    format(addDays(SUNDAY, day), 'EEE', { locale }),
  );

  LocaleConfig.locales[language] = {
    monthNames,
    monthNamesShort,
    dayNames,
    dayNamesShort,
    today: todayLabel,
  };
  LocaleConfig.defaultLocale = language;
}
