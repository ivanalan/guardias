import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { Calendar, CalendarList, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle, SCREEN_PAGE_TITLE_ICON_SIZE } from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import { parseCalendarDate } from '../../../lib/shifts/parse-calendar-date';
import { Pressable, View } from '../../../tw';
import { SCREEN_GUTTER, FLOATING_TAB_BAR_CLEARANCE } from '../../../theme/layout';
import { useTheme } from '../../../theme/theme-context';
import { toISODate } from '../../rotations/format-period-range';
import { useRotations } from '../../rotations/rotations-context';
import type { RotationPeriod } from '../../rotations/types';
import type { CalendarStackParamList } from '../calendar-stack';
import {
  buildMarkedDates,
  type CalendarLegendFilter,
} from '../build-marked-dates';
import { buildCalendarDayMarkContext } from '../calendar-day-marker';
import { CALENDAR_WEEK_ROW_GAP } from '../calendar-day-marker';
import {
  CALENDAR_CARD_PADDING_VERTICAL,
  CALENDAR_CARD_STYLE,
  CALENDAR_LIST_CARD_HEIGHT,
  CALENDAR_LIST_ITEM_GAP,
  CALENDAR_LIST_ITEM_HEIGHT,
  calendarListThemeFor,
  calendarThemeFor,
} from '../calendar-theme';
import type { CalendarViewMode } from '../calendar-view-mode';
import { createCalendarDayComponent } from '../components/calendar-day';
import { CalendarMonthLegend } from '../components/calendar-month-legend';
import { CalendarMonthHeader } from '../components/calendar-month-header';
import { CalendarMonthTitle } from '../components/calendar-month-title';
import { CalendarViewToggle } from '../components/calendar-view-toggle';
import { ExportPeriodPickerModal } from '../components/export-period-picker-modal';
import { configureCalendarLocale } from '../configure-calendar-locale';
import { getMarkInputsForMonthWindow } from '../month-legend-stats';
import { shareShiftsIcs } from '../share-shifts-ics';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarHome'>;

type ListSize = {
  width: number;
  height: number;
};

/** Calendar home: single-month or scrollable list, with legend filter. */
export function CalendarScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [visibleMonth, setVisibleMonth] = useState(() => toISODate(new Date()));
  // Anchor for CalendarList remount — must not update while scrolling.
  const [scrollAnchor, setScrollAnchor] = useState(visibleMonth);
  const [listSize, setListSize] = useState<ListSize | null>(null);
  const [filter, setFilter] = useState<CalendarLegendFilter>(null);
  const [sharing, setSharing] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  // iOS cannot present the share sheet while the picker Modal is dismissing.
  const pendingExportRef = useRef<RotationPeriod | null>(null);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  // ±2 months so next/prev (and fast swipe) paints with marks before onMonthChange.
  const monthInputs = getMarkInputsForMonthWindow(periods, visibleMonth, 2);
  const markedDates = buildMarkedDates(
    monthInputs.shiftMarks,
    monthInputs.freeWeekendDates,
    monthInputs.vacationDates,
    filter,
  );
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const markContext = useMemo(
    () =>
      buildCalendarDayMarkContext(
        monthInputs.shiftMarks,
        monthInputs.freeWeekendDates,
        monthInputs.vacationDates,
        filter,
        todayIso,
      ),
    [
      monthInputs.shiftMarks,
      monthInputs.freeWeekendDates,
      monthInputs.vacationDates,
      filter,
      todayIso,
    ],
  );
  const DayComponent = useMemo(
    () => createCalendarDayComponent(markContext),
    [markContext],
  );

  useEffect(() => {
    if (filter === 'vacation' && monthInputs.vacationDayCount === 0) {
      setFilter(null);
    }
  }, [filter, monthInputs.vacationDayCount]);

  const onViewModeChange = (mode: CalendarViewMode) => {
    if (mode === 'scroll') {
      setScrollAnchor(visibleMonth);
      setFilter(null);
    }
    setViewMode(mode);
  };

  const onDayPress = (day: DateData) => {
    navigation.navigate('DayDetail', { date: day.dateString });
  };

  const runExport = async (period: RotationPeriod) => {
    if (sharing) {
      return;
    }
    setSharing(true);
    try {
      const result = await shareShiftsIcs(
        period,
        t('calendar.shareDialogTitle'),
      );
      if (!result.ok) {
        if (result.reason === 'empty') {
          Alert.alert(
            t('calendar.shareEmptyTitle'),
            t('calendar.shareEmptyBody'),
          );
        } else {
          Alert.alert(t('calendar.shareUnavailable'));
        }
      }
    } finally {
      setSharing(false);
    }
  };

  const flushPendingExport = () => {
    const period = pendingExportRef.current;
    if (period == null) {
      return;
    }
    pendingExportRef.current = null;
    void runExport(period);
  };

  const queueExportAfterPicker = (period: RotationPeriod) => {
    pendingExportRef.current = period;
    setPickerVisible(false);
    // Android often skips Modal onDismiss; delay past the dismiss animation.
    if (Platform.OS !== 'ios') {
      setTimeout(() => {
        flushPendingExport();
      }, 300);
    }
  };

  const onSharePress = () => {
    if (sharing) {
      return;
    }
    if (periods.length === 0) {
      Alert.alert(t('calendar.shareEmptyTitle'), t('calendar.shareEmptyBody'));
      return;
    }
    if (periods.length === 1) {
      void runExport(periods[0]!);
      return;
    }
    setPickerVisible(true);
  };

  const onPreviousMonth = () => {
    setVisibleMonth((prev) => {
      const date = parseCalendarDate(prev);
      return toISODate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    });
  };

  const onNextMonth = () => {
    setVisibleMonth((prev) => {
      const date = parseCalendarDate(prev);
      return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    });
  };

  const onListContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const next = {
      width: Math.round(width),
      height: Math.round(height),
    };
    if (next.width <= 0 || next.height <= 0) {
      return;
    }
    setListSize((prev) =>
      prev?.width === next.width && prev.height === next.height ? prev : next,
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScreenPageTitle
        title={t('tabs.calendar')}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.shareA11y')}
            onPress={onSharePress}
            disabled={sharing}
            className="px-2 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons
              name="share-outline"
              size={SCREEN_PAGE_TITLE_ICON_SIZE}
              color={colors.brand}
            />
          </Pressable>
        }
      />
      <View className="mb-3 mt-3 px-gutter">
        <CalendarViewToggle value={viewMode} onChange={onViewModeChange} />
      </View>
      <View
        className="flex-1 px-gutter"
        style={
          viewMode === 'month'
            ? { paddingBottom: FLOATING_TAB_BAR_CLEARANCE }
            : undefined
        }
      >
        <View
          className={viewMode === 'scroll' ? 'min-h-0 flex-1' : undefined}
          onLayout={onListContainerLayout}
        >
          {viewMode === 'month' ? (
            <View
              className="px-gutter py-5"
              style={{ ...CALENDAR_CARD_STYLE, backgroundColor: colors.bg1 }}
            >
              <Calendar
                key={`month-${language}-${CALENDAR_WEEK_ROW_GAP}`}
                initialDate={visibleMonth}
                onMonthChange={(month: DateData) => {
                  setVisibleMonth(month.dateString);
                }}
                onDayPress={onDayPress}
                enableSwipeMonths
                hideArrows
                firstDay={1}
                monthFormat="MMMM"
                markingType="custom"
                markedDates={markedDates}
                dayComponent={DayComponent}
                renderHeader={(date) => (
                  <CalendarMonthHeader
                    date={date}
                    monthFormat="MMMM"
                    onPreviousMonth={onPreviousMonth}
                    onNextMonth={onNextMonth}
                  />
                )}
                theme={calendarThemeFor(colors)}
              />
            </View>
          ) : listSize != null ? (
            <CalendarList
              key={`scroll-${language}-${scrollAnchor.slice(0, 7)}-${CALENDAR_WEEK_ROW_GAP}`}
              current={scrollAnchor}
              style={{ height: listSize.height }}
              contentContainerStyle={{
                paddingBottom: FLOATING_TAB_BAR_CLEARANCE,
              }}
              calendarWidth={listSize.width}
              calendarHeight={CALENDAR_LIST_ITEM_HEIGHT}
              calendarStyle={{
                backgroundColor: colors.bg1,
                paddingHorizontal: SCREEN_GUTTER,
                paddingVertical: CALENDAR_CARD_PADDING_VERTICAL,
                ...CALENDAR_CARD_STYLE,
                minHeight: CALENDAR_LIST_CARD_HEIGHT,
                marginBottom: CALENDAR_LIST_ITEM_GAP,
              }}
              onVisibleMonthsChange={(months: DateData[]) => {
                const primary = months[0];
                if (primary == null) {
                  return;
                }
                setVisibleMonth((prev) =>
                  prev.slice(0, 7) === primary.dateString.slice(0, 7)
                    ? prev
                    : primary.dateString,
                );
              }}
              onDayPress={onDayPress}
              hideArrows
              pastScrollRange={24}
              futureScrollRange={24}
              showScrollIndicator
              removeClippedSubviews={false}
              firstDay={1}
              monthFormat="MMMM"
              markingType="custom"
              markedDates={markedDates}
              dayComponent={DayComponent}
              renderHeader={(date) => (
                <CalendarMonthTitle date={date} monthFormat="MMMM" />
              )}
              theme={calendarListThemeFor(colors)}
            />
          ) : null}
        </View>
        {viewMode === 'month' ? (
          <CalendarMonthLegend
            shiftDayCount={monthInputs.shiftDayCount}
            freeWeekendCount={monthInputs.freeWeekendCount}
            vacationDayCount={monthInputs.vacationDayCount}
            shiftColor={monthInputs.shiftColor}
            filter={filter}
            onFilterChange={setFilter}
          />
        ) : null}
      </View>
      <ExportPeriodPickerModal
        visible={pickerVisible}
        periods={periods}
        language={language}
        onSelect={queueExportAfterPicker}
        onCancel={() => {
          pendingExportRef.current = null;
          setPickerVisible(false);
        }}
        onDismiss={flushPendingExport}
      />
    </View>
  );
}
