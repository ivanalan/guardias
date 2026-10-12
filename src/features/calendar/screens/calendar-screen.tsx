import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Share,
  type LayoutChangeEvent,
  type ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addMonths, format, startOfMonth } from 'date-fns';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle, SCREEN_PAGE_TITLE_ICON_SIZE } from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import { parseCalendarDate } from '../../../lib/shifts/parse-calendar-date';
import { Pressable, ScrollView, View } from '../../../tw';
import { FLOATING_TAB_BAR_CLEARANCE } from '../../../theme/layout';
import { useTheme } from '../../../theme/theme-context';
import { toISODate } from '../../rotations/format-period-range';
import { useRotations } from '../../rotations/rotations-context';
import { resolveRotationColor, resolveShiftMarks } from '../../rotations/rotation-colors';
import { buildShareUrl } from '../../rotations/share-rotation-link';
import type { RotationPeriod } from '../../rotations/types';
import type { CalendarStackParamList } from '../calendar-stack';
import {
  buildMarkedDates,
  EMPTY_CALENDAR_FILTER,
  pruneLegendFilterForMonthCounts,
  type CalendarLegendFilterState,
} from '../build-marked-dates';
import { buildCalendarDayMarkContext } from '../calendar-day-marker';
import { CALENDAR_WEEK_ROW_GAP } from '../calendar-day-marker';
import {
  CALENDAR_LIST_FIRST_DAY,
  CALENDAR_LIST_ITEM_GAP,
  calendarCardStyle,
  calendarListCardHeight,
  calendarListItemHeight,
  calendarListThemeFor,
  calendarThemeFor,
  weeksInCalendarMonth,
} from '../calendar-theme';
import type { CalendarViewMode } from '../calendar-view-mode';
import { createCalendarDayComponent } from '../components/calendar-day';
import { CalendarMonthLegend } from '../components/calendar-month-legend';
import { CalendarMonthHeader } from '../components/calendar-month-header';
import { CalendarMonthTitle } from '../components/calendar-month-title';
import { CalendarViewToggle } from '../components/calendar-view-toggle';
import { ExportPeriodPickerModal } from '../components/export-period-picker-modal';
import {
  RotationImageCaptureHost,
  type RotationImageShareRequest,
} from '../components/rotation-image-capture-host';
import {
  ShareDestinationModal,
  type ShareDestination,
} from '../components/share-destination-modal';
import { buildShiftExportEvent } from '../build-shift-export-event';
import { configureCalendarLocale } from '../configure-calendar-locale';
import { getMarkInputsForMonthWindow } from '../month-legend-stats';
import { openDeviceCalendar } from '../open-device-calendar';
import { openGoogleCalendar } from '../open-google-calendar';
import { shareShiftsIcs } from '../share-shifts-ics';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarHome'>;

const YEAR_PAST_MONTHS = 24;
const YEAR_FUTURE_MONTHS = 24;

type YearMonthItem = {
  monthDate: string;
  weeks: number;
  length: number;
  offset: number;
};

type ListSize = {
  width: number;
  height: number;
};

type PendingShare = {
  period: RotationPeriod;
  destination: ShareDestination;
};

/** Calendar home: single-month or scrollable list, with legend filter. */
export function CalendarScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [visibleMonth, setVisibleMonth] = useState(() => toISODate(new Date()));
  // Anchor for year-list remount — must not update while scrolling.
  const [scrollAnchor, setScrollAnchor] = useState(visibleMonth);
  const [listSize, setListSize] = useState<ListSize | null>(null);
  const [filter, setFilter] = useState<CalendarLegendFilterState>(
    EMPTY_CALENDAR_FILTER,
  );
  const [sharing, setSharing] = useState(false);
  const [periodPickerVisible, setPeriodPickerVisible] = useState(false);
  const [destVisible, setDestVisible] = useState(false);
  const [imageRequest, setImageRequest] =
    useState<RotationImageShareRequest | null>(null);
  // Period chosen for the destination sheet (may outlive the period picker).
  const selectedPeriodRef = useRef<RotationPeriod | null>(null);
  // Open destination after the period picker finishes dismissing (iOS).
  const openDestAfterPeriodPickerRef = useRef(false);
  // iOS cannot present share / Linking while a Modal is dismissing.
  const pendingShareRef = useRef<PendingShare | null>(null);
  /** Day open in DayDetail — brand ring until the sheet dismisses. */
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  /** Ephemeral: 5+ friends expand overflow chips in place; resets on remount. */
  const [friendsExpanded, setFriendsExpanded] = useState(false);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  useEffect(() => {
    return navigation.addListener('state', () => {
      const state = navigation.getState();
      const dayDetailOpen = state.routes.some(
        (route) => route.name === 'DayDetail',
      );
      if (!dayDetailOpen) {
        setSelectedDate(null);
      }
    });
  }, [navigation]);

  // ±2 months so next/prev (and fast swipe) paints with marks before onMonthChange.
  const monthInputs = getMarkInputsForMonthWindow(periods, visibleMonth, 2);
  const resolvedShiftMarks = useMemo(
    () => resolveShiftMarks(monthInputs.shiftMarks, colors),
    [monthInputs.shiftMarks, colors],
  );
  const resolvedSecondaryShiftMarks = useMemo(
    () => resolveShiftMarks(monthInputs.secondaryShiftMarks, colors),
    [monthInputs.secondaryShiftMarks, colors],
  );
  const resolvedShiftColor = resolveRotationColor(monthInputs.shiftColor, colors);
  const markedDates = buildMarkedDates(
    resolvedShiftMarks,
    monthInputs.freeWeekendDates,
    monthInputs.vacationDates,
    resolvedSecondaryShiftMarks,
  );
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const markContext = useMemo(
    () =>
      buildCalendarDayMarkContext(
        resolvedShiftMarks,
        monthInputs.freeWeekendDates,
        monthInputs.vacationDates,
        filter,
        todayIso,
        null,
        resolvedSecondaryShiftMarks,
        visibleMonth.slice(0, 7),
        monthInputs.skippedDates,
        selectedDate,
      ),
    [
      resolvedShiftMarks,
      resolvedSecondaryShiftMarks,
      monthInputs.freeWeekendDates,
      monthInputs.vacationDates,
      monthInputs.skippedDates,
      filter,
      todayIso,
      visibleMonth,
      selectedDate,
    ],
  );
  const DayComponent = useMemo(
    () => createCalendarDayComponent(markContext),
    [markContext],
  );

  const secondaryPeriodIdsKey = monthInputs.secondaryLegend
    .map((entry) => entry.periodId)
    .join('\0');

  useEffect(() => {
    setFilter((prev) =>
      pruneLegendFilterForMonthCounts(prev, {
        shiftDayCount: monthInputs.shiftDayCount,
        freeWeekendCount: monthInputs.freeWeekendCount,
        vacationDayCount: monthInputs.vacationDayCount,
        secondaryPeriodIds: secondaryPeriodIdsKey
          ? secondaryPeriodIdsKey.split('\0')
          : [],
      }),
    );
  }, [
    monthInputs.shiftDayCount,
    monthInputs.freeWeekendCount,
    monthInputs.vacationDayCount,
    secondaryPeriodIdsKey,
  ]);

  const onViewModeChange = (mode: CalendarViewMode) => {
    if (mode === 'scroll') {
      setScrollAnchor(visibleMonth);
      setFilter(EMPTY_CALENDAR_FILTER);
    }
    setViewMode(mode);
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    navigation.navigate('DayDetail', { date: day.dateString });
  };

  const runShare = async (
    period: RotationPeriod,
    destination: ShareDestination,
  ) => {
    if (sharing) {
      return;
    }
    setSharing(true);
    try {
      if (destination === 'image') {
        setImageRequest({ period });
        return;
      }

      if (destination === 'link') {
        const url = buildShareUrl(period);
        try {
          await Share.share(
            Platform.OS === 'ios' ? { url } : { message: url },
          );
        } catch {
          Alert.alert(
            t('shifts.detail.shareFailedTitle'),
            t('shifts.detail.shareFailedBody'),
          );
        }
        return;
      }

      if (destination === 'google') {
        const event = buildShiftExportEvent(period);
        const details =
          event != null && event.exDates.length > 0
            ? t('calendar.shareGoogleVacationNote', {
                dates: event.exDates.join(', '),
              })
            : undefined;
        const result = await openGoogleCalendar(period, { details });
        if (!result.ok) {
          if (result.reason === 'empty') {
            Alert.alert(
              t('calendar.shareEmptyTitle'),
              t('calendar.shareEmptyBody'),
            );
          } else {
            Alert.alert(t('calendar.shareGoogleFailed'));
          }
        }
        return;
      }

      if (destination === 'device') {
        const event = buildShiftExportEvent(period);
        const notes =
          event != null && event.exDates.length > 0
            ? t('calendar.shareDeviceVacationNote', {
                dates: event.exDates.join(', '),
              })
            : undefined;
        const result = await openDeviceCalendar(period, { notes });
        if (!result.ok) {
          if (result.reason === 'empty') {
            Alert.alert(
              t('calendar.shareEmptyTitle'),
              t('calendar.shareEmptyBody'),
            );
          } else {
            Alert.alert(t('calendar.shareDeviceFailed'));
          }
        }
        return;
      }

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
      if (destination !== 'image') {
        setSharing(false);
      }
    }
  };

  const onImageShareComplete = (
    result: 'saved' | 'shared' | 'empty' | 'unavailable' | 'failed',
  ) => {
    setImageRequest(null);
    setSharing(false);
    if (result === 'saved') {
      Alert.alert(
        t('calendar.shareImageSavedTitle'),
        t('calendar.shareImageSavedBody'),
      );
      return;
    }
    if (result === 'empty') {
      Alert.alert(t('calendar.shareEmptyTitle'), t('calendar.shareEmptyBody'));
      return;
    }
    if (result === 'unavailable') {
      Alert.alert(t('calendar.shareUnavailable'));
      return;
    }
    if (result === 'failed') {
      Alert.alert(
        t('calendar.shareImageFailedTitle'),
        t('calendar.shareImageFailedBody'),
      );
    }
  };

  const flushPendingShare = () => {
    const pending = pendingShareRef.current;
    if (pending == null) {
      return;
    }
    pendingShareRef.current = null;
    void runShare(pending.period, pending.destination);
  };

  const flushOpenDestAfterPeriodPicker = () => {
    if (!openDestAfterPeriodPickerRef.current) {
      return;
    }
    openDestAfterPeriodPickerRef.current = false;
    if (selectedPeriodRef.current != null) {
      setDestVisible(true);
    }
  };

  const queueDestAfterPeriodPicker = (period: RotationPeriod) => {
    selectedPeriodRef.current = period;
    openDestAfterPeriodPickerRef.current = true;
    setPeriodPickerVisible(false);
    // Android often skips Modal onDismiss; delay past the dismiss animation.
    if (Platform.OS !== 'ios') {
      setTimeout(() => {
        flushOpenDestAfterPeriodPicker();
      }, 300);
    }
  };

  const queueShareAfterDest = (destination: ShareDestination) => {
    const period = selectedPeriodRef.current;
    if (period == null) {
      setDestVisible(false);
      return;
    }
    pendingShareRef.current = { period, destination };
    setDestVisible(false);
    if (Platform.OS !== 'ios') {
      setTimeout(() => {
        flushPendingShare();
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
      selectedPeriodRef.current = periods[0]!;
      setDestVisible(true);
      return;
    }
    setPeriodPickerVisible(true);
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

  const yearMonths = useMemo(() => {
    const center = startOfMonth(parseCalendarDate(scrollAnchor));
    const items: YearMonthItem[] = [];
    let offset = 0;
    for (let i = -YEAR_PAST_MONTHS; i <= YEAR_FUTURE_MONTHS; i += 1) {
      const monthDate = format(addMonths(center, i), 'yyyy-MM-dd');
      const weeks = weeksInCalendarMonth(monthDate, CALENDAR_LIST_FIRST_DAY);
      const length = calendarListItemHeight(weeks);
      items.push({ monthDate, weeks, length, offset });
      offset += length;
    }
    return items;
  }, [scrollAnchor]);

  const getYearItemLayout = useCallback(
    (_: ArrayLike<YearMonthItem> | null | undefined, index: number) => {
      const item = yearMonths[index]!;
      return { length: item.length, offset: item.offset, index };
    },
    [yearMonths],
  );

  const onYearViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const primary = viewableItems[0]?.item as YearMonthItem | undefined;
      if (primary == null) {
        return;
      }
      setVisibleMonth((prev) =>
        prev.slice(0, 7) === primary.monthDate.slice(0, 7)
          ? prev
          : primary.monthDate,
      );
    },
  ).current;

  const yearViewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 20,
  }).current;

  const renderYearMonth = useCallback(
    ({ item }: { item: YearMonthItem }) => (
      <Calendar
        key={item.monthDate}
        current={item.monthDate}
        hideArrows
        hideDayNames
        hideExtraDays
        firstDay={CALENDAR_LIST_FIRST_DAY}
        monthFormat="MMMM yyyy"
        markingType="custom"
        markedDates={markedDates}
        dayComponent={DayComponent}
        onDayPress={onDayPress}
        disableMonthChange
        renderHeader={(date) => (
          <CalendarMonthTitle date={date} monthFormat="MMMM yyyy" />
        )}
        style={{
          ...calendarCardStyle(colors, calendarListCardHeight(item.weeks)),
          width: listSize?.width,
          height: calendarListCardHeight(item.weeks),
          marginBottom: CALENDAR_LIST_ITEM_GAP,
        }}
        theme={calendarListThemeFor(colors)}
      />
    ),
    [colors, listSize?.width, markedDates, DayComponent, onDayPress],
  );

  const header = (
    <>
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
              name="share-social-outline"
              size={SCREEN_PAGE_TITLE_ICON_SIZE}
              color={colors.brand}
            />
          </Pressable>
        }
      />
      <View className="mb-6 mt-3 px-gutter">
        <CalendarViewToggle value={viewMode} onChange={onViewModeChange} />
      </View>
    </>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {viewMode === 'month' ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_CLEARANCE }}
        >
          {header}
          <View className="px-gutter">
            <Calendar
              key={`month-${language}-${CALENDAR_WEEK_ROW_GAP}`}
              style={calendarCardStyle(
                colors,
                calendarListCardHeight(
                  weeksInCalendarMonth(visibleMonth, CALENDAR_LIST_FIRST_DAY),
                ),
              )}
              initialDate={visibleMonth}
              onMonthChange={(month: DateData) => {
                setVisibleMonth(month.dateString);
              }}
              onDayPress={onDayPress}
              enableSwipeMonths
              hideArrows
              hideDayNames
              firstDay={1}
              monthFormat="MMMM yyyy"
              markingType="custom"
              markedDates={markedDates}
              dayComponent={DayComponent}
              renderHeader={(date) => (
                <CalendarMonthHeader
                  date={date}
                  monthFormat="MMMM yyyy"
                  onPreviousMonth={onPreviousMonth}
                  onNextMonth={onNextMonth}
                />
              )}
              theme={calendarThemeFor(colors)}
            />
            <CalendarMonthLegend
              shiftDayCount={monthInputs.shiftDayCount}
              freeWeekendCount={monthInputs.freeWeekendCount}
              vacationDayCount={monthInputs.vacationDayCount}
              shiftColor={resolvedShiftColor}
              primaryLabel={monthInputs.primaryLabel}
              secondaryLegend={monthInputs.secondaryLegend}
              friendsExpanded={friendsExpanded}
              onExpandFriends={() => setFriendsExpanded(true)}
              filter={filter}
              onFilterChange={setFilter}
            />
          </View>
        </ScrollView>
      ) : (
        <>
          {header}
          <View className="flex-1 px-gutter">
            <View className="min-h-0 flex-1" onLayout={onListContainerLayout}>
              {listSize != null ? (
                <FlatList
                  key={`scroll-${language}-${scrollAnchor.slice(0, 7)}-${CALENDAR_WEEK_ROW_GAP}`}
                  data={yearMonths}
                  style={{ height: listSize.height }}
                  contentContainerStyle={{
                    paddingBottom: FLOATING_TAB_BAR_CLEARANCE,
                  }}
                  keyExtractor={(item) => item.monthDate}
                  renderItem={renderYearMonth}
                  getItemLayout={getYearItemLayout}
                  initialScrollIndex={YEAR_PAST_MONTHS}
                  initialNumToRender={3}
                  windowSize={5}
                  showsVerticalScrollIndicator
                  removeClippedSubviews={false}
                  onViewableItemsChanged={onYearViewableItemsChanged}
                  viewabilityConfig={yearViewabilityConfig}
                />
              ) : null}
            </View>
          </View>
        </>
      )}
      <ExportPeriodPickerModal
        visible={periodPickerVisible}
        periods={periods}
        language={language}
        onSelect={queueDestAfterPeriodPicker}
        onCancel={() => {
          openDestAfterPeriodPickerRef.current = false;
          selectedPeriodRef.current = null;
          setPeriodPickerVisible(false);
        }}
        onDismiss={flushOpenDestAfterPeriodPicker}
      />
      <ShareDestinationModal
        visible={destVisible}
        linkPrimary
        rotationLabel={selectedPeriodRef.current?.label}
        onSelect={queueShareAfterDest}
        onCancel={() => {
          pendingShareRef.current = null;
          selectedPeriodRef.current = null;
          setDestVisible(false);
        }}
        onDismiss={flushPendingShare}
      />
      <RotationImageCaptureHost
        request={imageRequest}
        language={language}
        onComplete={onImageShareComplete}
      />
    </View>
  );
}
