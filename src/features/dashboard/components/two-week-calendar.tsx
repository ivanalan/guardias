import type { ReactNode } from 'react';

import {
  CALENDAR_WEEK_ROW_GAP,
  CELL_SIZE,
  DAY_MARKER_INNER_RADIUS,
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
  type DayMarkKind,
} from '../../calendar/calendar-day-marker';
import { calendarMarkColorsFor } from '../../calendar/calendar-mark-colors';
import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';

type TwoWeekCalendarProps = {
  dates: readonly string[];
  weekdayLabels: readonly string[];
  todayIso: string;
  shiftDates: ReadonlySet<string>;
  freeWeekendDates: ReadonlySet<string>;
  vacationDates: ReadonlySet<string>;
  shiftColor: string;
};

/** Two-week Monday-start strip with shift / vacation marks and weekend pills. */
export function TwoWeekCalendar({
  dates,
  weekdayLabels,
  todayIso,
  shiftDates,
  freeWeekendDates,
  vacationDates,
  shiftColor,
}: TwoWeekCalendarProps) {
  const { colors } = useTheme();
  const markColors = calendarMarkColorsFor(colors);
  const weeks = [dates.slice(0, 7), dates.slice(7, 14)];
  const shiftColorByDate = new Map<string, string>();
  for (const iso of shiftDates) {
    shiftColorByDate.set(iso, shiftColor);
  }
  const markCtx = {
    shiftColorByDate,
    freeWeekendSet: freeWeekendDates,
    vacationSet: vacationDates,
  };

  return (
    <View
      className="w-full px-gutter py-5"
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius: 32,
        gap: CALENDAR_WEEK_ROW_GAP,
      }}
    >
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
          shiftColor={shiftColor}
          inkColor={colors.brand}
          textColor={colors.text}
          markColors={markColors}
        />
      ))}
    </View>
  );
}

type MarkCtx = {
  shiftColorByDate: ReadonlyMap<string, string>;
  freeWeekendSet: ReadonlySet<string>;
  vacationSet: ReadonlySet<string>;
};

type WeekRowProps = {
  week: readonly string[];
  todayIso: string;
  markCtx: MarkCtx;
  shiftColor: string;
  inkColor: string;
  textColor: string;
  markColors: ReturnType<typeof calendarMarkColorsFor>;
};

function WeekRow({
  week,
  todayIso,
  markCtx,
  shiftColor,
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
          <View
            className="flex-row self-stretch"
            style={{
              height: CELL_SIZE,
              backgroundColor: resolveWeekendBackground(markColors, weekendAlpha),
              ...dayMarkerStyle,
            }}
          >
            <DayCell
              iso={iso}
              todayIso={todayIso}
              markKind="freeWeekend"
              markAlpha={weekendAlpha}
              shiftColor={shiftColor}
              inkColor={inkColor}
              textColor={textColor}
              markColors={markColors}
            />
            <DayCell
              iso={next}
              todayIso={todayIso}
              markKind="freeWeekend"
              markAlpha={weekendAlpha}
              shiftColor={shiftColor}
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
          shiftColor={shiftColor}
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
  shiftColor: string;
  inkColor: string;
  textColor: string;
  markColors: ReturnType<typeof calendarMarkColorsFor>;
  markAlpha?: number;
};

function DayCell({
  iso,
  todayIso,
  markKind,
  shiftColor,
  inkColor,
  textColor,
  markColors,
  markAlpha,
}: DayCellProps) {
  const isToday = iso === todayIso;
  const label = dayNumber(iso);
  const alpha =
    markAlpha ?? markColorAlpha(false, isCalendarDatePast(iso, todayIso));
  const onWeekend = markKind === 'freeWeekend';
  const isShift = markKind === 'shift';
  const isVacation = markKind === 'vacation';

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
    : isShift
      ? resolveShiftColor(shiftColor, alpha)
      : undefined;
  const todayFilled = isToday && fillColor != null;

  return (
    <View
      className="flex-1 items-center justify-center"
      style={
        onWeekend
          ? { height: CELL_SIZE }
          : { paddingVertical: CALENDAR_WEEK_ROW_GAP / 2 }
      }
    >
      {todayFilled ? (
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
      )}
    </View>
  );
}
