import { differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { parseCalendarDate } from '../../../lib/shifts/parse-calendar-date';
import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius, WIDGET_RADIUS } from '../../../theme/widget-radius';
import { Text, View } from '../../../tw';
import { dayNumber } from '../../calendar/calendar-day-marker';
import { formatWeekdayLong } from '../../dashboard/format-home-copy';
import { resolveRotationColor } from '../rotation-colors';
import { EMPTY_STATE_PREVIEW } from './empty-state-preview-data';

const RAIL = 34;
const RAIL_RADIUS = 10;
/** Three upcoming sample shifts after the preview “today”. */
const UPCOMING_ISOS = ['2026-08-06', '2026-08-11', '2026-08-15'] as const;

/** Sample upcoming-shifts widget for the empty-state info page. */
export function GhostWidgetPreview({ language }: { language: AppLanguage }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { borderRadius, onLayout } = useWidgetBorderRadius();
  const shiftColor = resolveRotationColor(
    EMPTY_STATE_PREVIEW.shiftColor,
    colors,
  );
  const today = parseCalendarDate(EMPTY_STATE_PREVIEW.todayIso);

  return (
    <View
      className="w-full gap-3 px-gutter py-widget"
      onLayout={onLayout}
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius,
      }}
    >
      <Text
        className="font-serif text-2xl tracking-tight"
        style={{ color: colors.text }}
      >
        {t('shifts.emptyInfoWidgetTitle')}
      </Text>
      <View
        className="w-full gap-0"
        style={{
          backgroundColor: colors.bg,
          borderCurve: 'continuous',
          borderRadius: WIDGET_RADIUS,
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        {UPCOMING_ISOS.map((iso, index) => {
          const daysUntil = differenceInCalendarDays(
            parseCalendarDate(iso),
            today,
          );
          const isNext = index === 0;
          const relativeLabel =
            daysUntil <= 0
              ? t('home.today')
              : t('home.inDays', { count: daysUntil });

          return (
            <View key={iso}>
              <View className="flex-row items-center py-2">
                <View
                  className="items-center justify-center"
                  style={{
                    width: RAIL,
                    height: RAIL,
                    borderCurve: 'continuous',
                    borderRadius: RAIL_RADIUS,
                    backgroundColor: isNext ? shiftColor : colors.bgPillTrack,
                  }}
                >
                  <Text
                    className="font-mono text-sm"
                    style={{
                      color: isNext ? colors.onColor : colors.text,
                      fontWeight: isNext ? '700' : '500',
                    }}
                  >
                    {dayNumber(iso)}
                  </Text>
                </View>
                <View className="ml-3 min-w-0 flex-1 gap-0.5">
                  <Text
                    className="font-mono text-sm"
                    style={{
                      color: colors.text,
                      fontWeight: isNext ? '600' : '500',
                    }}
                    numberOfLines={1}
                  >
                    {formatWeekdayLong(parseCalendarDate(iso), language)}
                  </Text>
                  <Text
                    className="font-mono text-xs"
                    style={{ color: colors.textMuted }}
                    numberOfLines={1}
                  >
                    {relativeLabel}
                  </Text>
                </View>
              </View>
              {index < UPCOMING_ISOS.length - 1 ? (
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.bgPillTrack,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
