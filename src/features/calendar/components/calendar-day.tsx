import type { ComponentType, ReactNode } from 'react';
import type { DateData } from 'react-native-calendars';
import type { DayProps } from 'react-native-calendars/src/calendar/day';

import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import {
  addCalendarDays,
  CALENDAR_WEEK_ROW_GAP,
  CELL_SIZE,
  DAY_MARKER_INNER_RADIUS,
  TODAY_BORDER_WIDTH,
  TODAY_INNER_GAP,
  type CalendarDayMarkContext,
  dayMarkerStyle,
  dayNumber,
  getDayMarkKind,
  getMarkDimming,
  isCalendarDatePast,
  isFreeWeekendSpanEnd,
  isFreeWeekendSpanStart,
  markColorAlpha,
  resolveInkTextColor,
  resolveShiftColor,
  resolveShiftTextColor,
  resolveVacationBackground,
  resolveVacationTextColor,
  resolveWeekendBackground,
} from '../calendar-day-marker';
import { calendarMarkColorsFor } from '../calendar-mark-colors';

type CalendarDayProps = DayProps & {
  date?: DateData;
};

const dayRowPadding = CALENDAR_WEEK_ROW_GAP / 2;

const daySlotStyle = {
  alignSelf: 'stretch' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  minHeight: CELL_SIZE + CALENDAR_WEEK_ROW_GAP,
  paddingVertical: dayRowPadding,
  overflow: 'visible' as const,
};

const dayMarkerBoxStyle = {
  width: CELL_SIZE,
  height: CELL_SIZE,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const weekendSpanPressableStyle = {
  alignSelf: 'stretch' as const,
  flex: 1,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

/** Full Sat–Sun capsule, painted only from Saturday so the join never double-blends. */
function weekendSpanPillStyle(backgroundColor: string) {
  return {
    position: 'absolute' as const,
    top: '50%' as const,
    marginTop: -CELL_SIZE / 2,
    left: 0,
    // Equal flex day cells → 200% covers Saturday + Sunday with one fill.
    width: '200%' as const,
    height: CELL_SIZE,
    backgroundColor,
    zIndex: 0,
    ...dayMarkerStyle,
  };
}

/** Factory: custom day cell wired to shared mark context. */
export function createCalendarDayComponent(
  ctx: CalendarDayMarkContext,
): ComponentType<CalendarDayProps> {
  return function CalendarDay(props: CalendarDayProps) {
    return <CalendarDayInner {...props} markContext={ctx} />;
  };
}

type InnerProps = CalendarDayProps & {
  markContext: CalendarDayMarkContext;
};

function CalendarDayInner({
  date,
  state,
  onPress,
  onLongPress,
  marking,
  markContext,
  testID,
}: InnerProps) {
  const { colors } = useTheme();
  const markColors = calendarMarkColorsFor(colors);
  const iso = date?.dateString;
  if (iso == null) {
    return <View style={daySlotStyle} />;
  }

  const inactive = state === 'inactive' || state === 'disabled';
  const isToday = iso === markContext.todayIso || state === 'today';
  const label = dayNumber(iso);
  const markKind = getDayMarkKind(iso, markContext);
  const dimming = getMarkDimming(markContext.filter);
  const isPast = isCalendarDatePast(iso, markContext.todayIso);

  const handlePress = () => {
    if (date != null) {
      onPress?.(date);
    }
  };

  const handleLongPress = () => {
    if (date != null) {
      onLongPress?.(date);
    }
  };

  const disableTouch =
    marking?.disableTouchEvent === true ||
    (inactive && marking?.disableTouchEvent !== false);

  if (
    isFreeWeekendSpanEnd(iso, markContext.freeWeekendSet, markKind) &&
    !inactive
  ) {
    // Background comes from Saturday’s 200%-wide pill; keep this cell above it.
    const weekendAlpha = markColorAlpha(
      dimming.dimFreeWeekends,
      isPast,
    );
    const textColor = resolveShiftTextColor(markColors, weekendAlpha);

    return (
      <View style={daySlotStyle}>
        <Pressable
          accessibilityRole="button"
          disabled={disableTouch}
          onPress={handlePress}
          onLongPress={handleLongPress}
          testID={testID}
          className="active:opacity-80"
          style={[weekendSpanPressableStyle, { zIndex: 1 }]}
        >
          {isToday ? (
            <TodayOutline
              label={label}
              textColor={textColor}
              inkColor={colors.brand}
            />
          ) : (
            <View style={dayMarkerBoxStyle}>
              <Text className="font-mono text-sm" style={{ color: textColor }}>
                {label}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  }

  if (
    isFreeWeekendSpanStart(iso, markContext.freeWeekendSet, markKind) &&
    !inactive
  ) {
    const weekendPast = isCalendarDatePast(
      addCalendarDays(iso, 1),
      markContext.todayIso,
    );
    const weekendAlpha = markColorAlpha(
      dimming.dimFreeWeekends,
      weekendPast,
    );
    const weekendBg = resolveWeekendBackground(markColors, weekendAlpha);
    const textColor = resolveShiftTextColor(markColors, weekendAlpha);

    return (
      <View style={daySlotStyle}>
        <Pressable
          accessibilityRole="button"
          disabled={disableTouch}
          onPress={handlePress}
          onLongPress={handleLongPress}
          testID={testID}
          className="active:opacity-80"
          style={weekendSpanPressableStyle}
        >
          <View
            pointerEvents="none"
            style={weekendSpanPillStyle(weekendBg)}
          />
          {isToday ? (
            <View style={{ zIndex: 1 }}>
              <TodayOutline
                label={label}
                textColor={textColor}
                inkColor={colors.brand}
              />
            </View>
          ) : (
            <View style={[dayMarkerBoxStyle, { zIndex: 1 }]}>
              <Text className="font-mono text-sm" style={{ color: textColor }}>
                {label}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  }

  if (markKind === 'shift' && !inactive) {
    const shiftColor = markContext.shiftColorByDate.get(iso)!;
    const shiftAlpha = markColorAlpha(dimming.dimShifts, isPast);
    const backgroundColor = resolveShiftColor(shiftColor, shiftAlpha);
    const textColor = resolveShiftTextColor(markColors, shiftAlpha);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {isToday ? (
          <TodayFilledMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            inkColor={colors.brand}
          />
        ) : (
          <View
            className="items-center justify-center"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor,
              ...dayMarkerStyle,
            }}
          >
            <Text className="font-mono text-sm" style={{ color: textColor }}>
              {label}
            </Text>
          </View>
        )}
      </DayShell>
    );
  }

  if (markKind === 'vacation' && !inactive) {
    const vacationAlpha = markColorAlpha(dimming.dimVacations, isPast);
    const backgroundColor = resolveVacationBackground(markColors, vacationAlpha);
    const textColor = resolveVacationTextColor(markColors, vacationAlpha);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {isToday ? (
          <TodayFilledMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            inkColor={colors.brand}
          />
        ) : (
          <View
            className="items-center justify-center"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor,
              ...dayMarkerStyle,
            }}
          >
            <Text className="font-mono text-sm" style={{ color: textColor }}>
              {label}
            </Text>
          </View>
        )}
      </DayShell>
    );
  }

  if (markKind === 'freeWeekend' && !inactive) {
    const weekendAlpha = markColorAlpha(dimming.dimFreeWeekends, isPast);
    const backgroundColor = resolveWeekendBackground(markColors, weekendAlpha);
    const textColor = resolveShiftTextColor(markColors, weekendAlpha);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {isToday ? (
          <TodayFilledMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            inkColor={colors.brand}
          />
        ) : (
          <View
            className="items-center justify-center"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor,
              ...dayMarkerStyle,
            }}
          >
            <Text className="font-mono text-sm" style={{ color: textColor }}>
              {label}
            </Text>
          </View>
        )}
      </DayShell>
    );
  }

  const textColor = resolveInkTextColor(colors.text, inactive);

  return (
    <DayShell
      disableTouch={disableTouch}
      onPress={handlePress}
      onLongPress={handleLongPress}
      testID={testID}
    >
      {isToday && !inactive ? (
        <TodayOutline
          label={label}
          textColor={textColor}
          inkColor={colors.brand}
        />
      ) : (
        <View
          className="items-center justify-center"
          style={{ width: CELL_SIZE, height: CELL_SIZE }}
        >
          <Text className="font-mono text-sm" style={{ color: textColor }}>
            {label}
          </Text>
        </View>
      )}
    </DayShell>
  );
}

type DayShellProps = {
  children: ReactNode;
  disableTouch: boolean;
  onPress: () => void;
  onLongPress: () => void;
  testID?: string;
};

function DayShell({
  children,
  disableTouch,
  onPress,
  onLongPress,
  testID,
}: DayShellProps) {
  return (
    <View style={daySlotStyle}>
      <Pressable
        accessibilityRole="button"
        disabled={disableTouch}
        onPress={onPress}
        onLongPress={onLongPress}
        testID={testID}
        className="flex-1 items-center justify-center self-stretch active:opacity-80"
      >
        {children}
      </Pressable>
    </View>
  );
}

function TodayOutline({
  label,
  textColor,
  inkColor,
}: {
  label: string;
  textColor: string;
  inkColor: string;
}) {
  return (
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
      <Text className="font-mono text-sm" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}

function TodayFilledMarker({
  label,
  backgroundColor,
  textColor,
  inkColor,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
  inkColor: string;
}) {
  return (
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
          backgroundColor,
          borderCurve: 'continuous',
          borderRadius: DAY_MARKER_INNER_RADIUS,
        }}
      >
        <Text className="font-mono text-sm" style={{ color: textColor }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
