import * as Haptics from 'expo-haptics';
import { useRef, useState, type ReactNode } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as RNScrollView,
} from 'react-native';

import {
  CALENDAR_WEEK_ROW_GAP,
  CELL_SIZE,
  DAY_MARKER_INNER_RADIUS,
  SECONDARY_DOT_SIZE,
  TODAY_BORDER_WIDTH,
  TODAY_INNER_GAP,
  dayMarkerStyle,
  dayNumber,
  getDayMarkKind,
  isCalendarDatePast,
  markColorAlpha,
  resolveShiftColor,
  resolveShiftTextColor,
  resolveVacationBackground,
  resolveVacationTextColor,
  resolveWeekendBackground,
  withAlpha,
  type DayMarkKind,
} from '../../calendar/calendar-day-marker';
import { calendarMarkColorsFor } from '../../calendar/calendar-mark-colors';
import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius } from '../../../theme/widget-radius';
import { Pressable, ScrollView, Text, View } from '../../../tw';

const PAGER_DOT_SIZE = 6;
const DAY_RAIL_SIZE = 28;
const DAY_RAIL_RADIUS = 10;

export type UpcomingShiftRow = {
  dayNumber: string;
  weekday: string;
  relativeLabel: string;
};

type TwoWeekCalendarProps = {
  dates: readonly string[];
  weekdayLabels: readonly string[];
  todayIso: string;
  shiftColorByDate: ReadonlyMap<string, string>;
  secondaryShiftColorByDate: ReadonlyMap<string, string>;
  freeWeekendDates: ReadonlySet<string>;
  vacationDates: ReadonlySet<string>;
  /** When set with list props, enables swipe/tap to upcoming shifts. */
  upcomingCaption?: string;
  upcomingEmptyCaption?: string;
  upcomingItems?: readonly UpcomingShiftRow[];
  upcomingAccentColor?: string;
};

/** Two-week Monday-start strip with shift / vacation marks and weekend pills. */
export function TwoWeekCalendar({
  dates,
  weekdayLabels,
  todayIso,
  shiftColorByDate,
  secondaryShiftColorByDate,
  freeWeekendDates,
  vacationDates,
  upcomingCaption,
  upcomingEmptyCaption,
  upcomingItems,
  upcomingAccentColor,
}: TwoWeekCalendarProps) {
  const { colors } = useTheme();
  const { borderRadius, onLayout: onRadiusLayout } = useWidgetBorderRadius();
  const canToggle =
    upcomingCaption != null &&
    upcomingEmptyCaption != null &&
    upcomingItems != null &&
    upcomingAccentColor != null;
  const scrollRef = useRef<RNScrollView>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const calendarPage = (
    <CalendarGrid
      dates={dates}
      weekdayLabels={weekdayLabels}
      todayIso={todayIso}
      shiftColorByDate={shiftColorByDate}
      secondaryShiftColorByDate={secondaryShiftColorByDate}
      freeWeekendDates={freeWeekendDates}
      vacationDates={vacationDates}
    />
  );

  const cardStyle = {
    backgroundColor: colors.bg1,
    borderCurve: 'continuous' as const,
    borderRadius,
  };

  if (!canToggle) {
    return (
      <View
        className="w-full px-gutter py-widget"
        style={cardStyle}
        onLayout={onRadiusLayout}
      >
        {calendarPage}
      </View>
    );
  }

  const onCardLayout = (event: LayoutChangeEvent) => {
    onRadiusLayout(event);
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setPageWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  };

  const goToPage = (nextIndex: number) => {
    if (pageWidth === 0) {
      return;
    }
    const clamped = nextIndex % 2;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPageIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: true });
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (pageWidth === 0) {
      return;
    }
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const next = index >= 1 ? 1 : 0;
    if (next === pageIndex) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPageIndex(next);
  };

  return (
    <View
      className="w-full gap-4 py-widget"
      style={cardStyle}
      onLayout={onCardLayout}
    >
      {pageWidth > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          bounces={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => goToPage(1)}
            className="px-gutter"
            style={{ width: pageWidth }}
          >
            {calendarPage}
          </Pressable>
          <UpcomingListPage
            caption={upcomingCaption}
            emptyCaption={upcomingEmptyCaption}
            color={upcomingAccentColor}
            items={upcomingItems}
            width={pageWidth}
            onPress={() => goToPage(0)}
          />
        </ScrollView>
      ) : null}
      <View className="flex-row items-center justify-center gap-2">
        {[0, 1].map((index) => (
          <View
            key={index}
            style={{
              width: PAGER_DOT_SIZE,
              height: PAGER_DOT_SIZE,
              borderRadius: PAGER_DOT_SIZE / 2,
              backgroundColor:
                pageIndex === index ? colors.text : colors.bgPillTrack,
            }}
          />
        ))}
      </View>
    </View>
  );
}

type CalendarGridProps = {
  dates: readonly string[];
  weekdayLabels: readonly string[];
  todayIso: string;
  shiftColorByDate: ReadonlyMap<string, string>;
  secondaryShiftColorByDate: ReadonlyMap<string, string>;
  freeWeekendDates: ReadonlySet<string>;
  vacationDates: ReadonlySet<string>;
};

function CalendarGrid({
  dates,
  weekdayLabels,
  todayIso,
  shiftColorByDate,
  secondaryShiftColorByDate,
  freeWeekendDates,
  vacationDates,
}: CalendarGridProps) {
  const { colors } = useTheme();
  const markColors = calendarMarkColorsFor(colors);
  const weeks = [dates.slice(0, 7), dates.slice(7, 14)];
  const markCtx = {
    shiftColorByDate,
    secondaryShiftColorByDate,
    freeWeekendSet: freeWeekendDates,
    vacationSet: vacationDates,
  };

  return (
    <View style={{ gap: CALENDAR_WEEK_ROW_GAP }}>
      <View className="flex-row">
        {weekdayLabels.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            className="flex-1 text-center font-mono text-sm"
            style={{ color: colors.text }}
          >
            {label}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <WeekRow
          key={week[0]}
          week={week}
          todayIso={todayIso}
          markCtx={markCtx}
          inkColor={colors.brand}
          textColor={colors.text}
          markColors={markColors}
        />
      ))}
    </View>
  );
}

type UpcomingListPageProps = {
  caption: string;
  emptyCaption: string;
  color: string;
  items: readonly UpcomingShiftRow[];
  width?: number;
  onPress?: () => void;
};

function UpcomingListPage({
  caption,
  emptyCaption,
  color,
  items,
  width,
  onPress,
}: UpcomingListPageProps) {
  const { colors } = useTheme();
  const rows: UpcomingShiftRow[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  const content = (
    <>
      <Text className="font-mono text-base" style={{ color: colors.text }}>
        {caption}
      </Text>
      {items.length > 0 ? (
        <View style={{ gap: CALENDAR_WEEK_ROW_GAP }}>
          {rows.map((row, rowIndex) => (
            <View
              key={`${row[0]!.dayNumber}-${row[0]!.relativeLabel}-${rowIndex}`}
              className="flex-row items-center"
              style={{
                gap: CALENDAR_WEEK_ROW_GAP,
                minHeight: CELL_SIZE + CALENDAR_WEEK_ROW_GAP,
              }}
            >
              {row.map((item, col) => {
                const index = rowIndex * 2 + col;
                const isNext = index === 0;
                return (
                  <View
                    key={`${item.dayNumber}-${item.relativeLabel}-${item.weekday}`}
                    className="flex-1 flex-row items-center gap-2.5"
                  >
                    <View
                      className="items-center justify-center"
                      style={{
                        width: DAY_RAIL_SIZE,
                        height: DAY_RAIL_SIZE,
                        backgroundColor: isNext ? color : colors.bgPillTrack,
                        borderCurve: 'continuous',
                        borderRadius: DAY_RAIL_RADIUS,
                      }}
                    >
                      <Text
                        className="font-mono text-sm"
                        style={{
                          color: isNext ? colors.onColor : colors.text,
                        }}
                      >
                        {item.dayNumber}
                      </Text>
                    </View>
                    <View className="gap-0">
                      <Text
                        className="font-mono text-base"
                        style={{ color: isNext ? color : colors.text }}
                      >
                        {item.weekday}
                      </Text>
                      <Text
                        className="font-mono text-sm"
                        style={{ color: colors.textMuted }}
                      >
                        {item.relativeLabel}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {row.length === 1 ? <View className="flex-1" /> : null}
            </View>
          ))}
        </View>
      ) : (
        <Text
          className="font-mono text-base"
          style={{ color: colors.textMuted }}
        >
          {emptyCaption}
        </Text>
      )}
    </>
  );

  if (onPress != null) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="gap-4 px-gutter"
        style={width != null ? { width } : undefined}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className="gap-4 px-gutter"
      style={width != null ? { width } : undefined}
    >
      {content}
    </View>
  );
}

type MarkCtx = {
  shiftColorByDate: ReadonlyMap<string, string>;
  secondaryShiftColorByDate: ReadonlyMap<string, string>;
  freeWeekendSet: ReadonlySet<string>;
  vacationSet: ReadonlySet<string>;
};

type WeekRowProps = {
  week: readonly string[];
  todayIso: string;
  markCtx: MarkCtx;
  inkColor: string;
  textColor: string;
  markColors: ReturnType<typeof calendarMarkColorsFor>;
};

function WeekRow({
  week,
  todayIso,
  markCtx,
  inkColor,
  textColor,
  markColors,
}: WeekRowProps) {
  const cells: ReactNode[] = [];

  for (let index = 0; index < week.length; index += 1) {
    const iso = week[index]!;
    const next = week[index + 1];
    const markKind = getDayMarkKind(iso, markCtx);
    const nextKind =
      next != null ? getDayMarkKind(next, markCtx) : ('none' as DayMarkKind);
    const isWeekendStart =
      index === 5 &&
      next != null &&
      markKind === 'freeWeekend' &&
      nextKind === 'freeWeekend';

    if (isWeekendStart) {
      const weekendAlpha = markColorAlpha(
        false,
        isCalendarDatePast(next, todayIso),
      );
      // Same vertical padding as DayCell so weekend numbers share the row baseline.
      cells.push(
        <View
          key={iso}
          className="flex-[2]"
          style={{ paddingVertical: CALENDAR_WEEK_ROW_GAP / 2 }}
        >
          <View className="flex-row self-stretch" style={{ height: CELL_SIZE }}>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                // Parent is Sat+Sun: 25% is each day’s center. Inset by
                // half CELL_SIZE so the capsule ends on the day markers.
                left: '25%',
                marginLeft: -CELL_SIZE / 2,
                right: '25%',
                marginRight: -CELL_SIZE / 2,
                backgroundColor: resolveWeekendBackground(
                  markColors,
                  weekendAlpha,
                ),
                ...dayMarkerStyle,
              }}
            />
            <DayCell
              iso={iso}
              todayIso={todayIso}
              markKind="freeWeekend"
              markAlpha={weekendAlpha}
              markCtx={markCtx}
              inkColor={inkColor}
              textColor={textColor}
              markColors={markColors}
            />
            <DayCell
              iso={next}
              todayIso={todayIso}
              markKind="freeWeekend"
              markAlpha={weekendAlpha}
              markCtx={markCtx}
              inkColor={inkColor}
              textColor={textColor}
              markColors={markColors}
            />
          </View>
        </View>,
      );
      index += 1;
      continue;
    }

    cells.push(
      <View key={iso} className="flex-1">
        <DayCell
          iso={iso}
          todayIso={todayIso}
          markKind={markKind}
          markCtx={markCtx}
          inkColor={inkColor}
          textColor={textColor}
          markColors={markColors}
        />
      </View>,
    );
  }

  return (
    <View
      className="flex-row items-start"
      style={{ minHeight: CELL_SIZE + CALENDAR_WEEK_ROW_GAP }}
    >
      {cells}
    </View>
  );
}

type DayCellProps = {
  iso: string;
  todayIso: string;
  markKind: DayMarkKind;
  markCtx: MarkCtx;
  inkColor: string;
  textColor: string;
  markColors: ReturnType<typeof calendarMarkColorsFor>;
  markAlpha?: number;
};

const SECONDARY_DOT_GAP = 4;

function DayCell({
  iso,
  todayIso,
  markKind,
  markCtx,
  inkColor,
  textColor,
  markColors,
  markAlpha,
}: DayCellProps) {
  const isToday = iso === todayIso;
  const label = dayNumber(iso);
  const isPast = isCalendarDatePast(iso, todayIso);
  const alpha = markAlpha ?? markColorAlpha(false, isPast);
  const onWeekend = markKind === 'freeWeekend';
  const isShift = markKind === 'shift';
  const isVacation = markKind === 'vacation';
  const shiftColor = markCtx.shiftColorByDate.get(iso);
  const secondaryColor = markCtx.secondaryShiftColorByDate.get(iso);
  const secondaryDot =
    secondaryColor != null ? (
      <SecondaryDot color={secondaryColor} isPast={isPast} />
    ) : null;

  const textColorMarked = isVacation
    ? resolveVacationTextColor(markColors, alpha)
    : onWeekend || isShift
      ? resolveShiftTextColor(markColors, alpha)
      : undefined;
  const dayTextStyle = {
    color: textColorMarked ?? textColor,
  };

  const fillColor = isVacation
    ? resolveVacationBackground(markColors, alpha)
    : isShift && shiftColor != null
      ? resolveShiftColor(shiftColor, alpha)
      : undefined;
  const todayFilled = isToday && fillColor != null;

  const dayContent = todayFilled ? (
    <View
      className="items-center justify-center"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: TODAY_BORDER_WIDTH,
        borderColor: inkColor,
        padding: TODAY_INNER_GAP,
        ...dayMarkerStyle,
      }}
    >
      <View
        className="flex-1 self-stretch items-center justify-center"
        style={{
          backgroundColor: fillColor,
          borderCurve: 'continuous',
          borderRadius: DAY_MARKER_INNER_RADIUS,
        }}
      >
        <Text className="font-mono text-sm" style={dayTextStyle}>
          {label}
        </Text>
      </View>
    </View>
  ) : isToday ? (
    <View
      className="items-center justify-center"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: TODAY_BORDER_WIDTH,
        borderColor: inkColor,
        ...dayMarkerStyle,
      }}
    >
      <Text className="font-mono text-sm" style={dayTextStyle}>
        {label}
      </Text>
    </View>
  ) : fillColor != null && !onWeekend ? (
    <View
      className="items-center justify-center"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: fillColor,
        ...dayMarkerStyle,
      }}
    >
      <Text className="font-mono text-sm" style={dayTextStyle}>
        {label}
      </Text>
    </View>
  ) : (
    <View
      className="items-center justify-center"
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    >
      <Text className="font-mono text-sm" style={dayTextStyle}>
        {label}
      </Text>
    </View>
  );

  return (
    <View
      className="flex-1 items-center justify-center"
      style={
        onWeekend
          ? { height: CELL_SIZE }
          : { paddingVertical: CALENDAR_WEEK_ROW_GAP / 2 }
      }
    >
      <View
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          alignItems: 'center',
        }}
      >
        {dayContent}
        {secondaryDot != null ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: CELL_SIZE + SECONDARY_DOT_GAP,
              alignItems: 'center',
            }}
          >
            {secondaryDot}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SecondaryDot({ color, isPast }: { color: string; isPast: boolean }) {
  const alpha = markColorAlpha(false, isPast);
  const backgroundColor = alpha < 1 ? withAlpha(color, alpha) : color;
  return (
    <View
      pointerEvents="none"
      style={{
        width: SECONDARY_DOT_SIZE,
        height: SECONDARY_DOT_SIZE,
        borderRadius: SECONDARY_DOT_SIZE / 2,
        backgroundColor,
      }}
    />
  );
}
