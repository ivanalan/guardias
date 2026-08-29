import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';
import { weekdayInitials } from '../../dashboard/format-home-copy';
import {
  CALENDAR_WEEKDAY_ROW_MARGIN_BOTTOM,
  CALENDAR_WEEKDAY_ROW_MARGIN_TOP,
} from '../calendar-theme';

/** Monday-first weekday initials. Owned here so theme changes apply at render. */
export function CalendarWeekdayRow() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const labels = weekdayInitials(language);

  return (
    <View
      className="flex-row"
      style={{
        marginTop: CALENDAR_WEEKDAY_ROW_MARGIN_TOP,
        marginBottom: CALENDAR_WEEKDAY_ROW_MARGIN_BOTTOM,
      }}
    >
      {labels.map((label, index) => (
        <Text
          key={`${label}-${index}`}
          className="flex-1 text-center font-mono text-sm"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
      ))}
    </View>
  );
}
