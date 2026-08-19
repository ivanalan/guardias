import type { ComponentType, ReactNode } from 'react';
import type { DateData } from 'react-native-calendars';
import type { DayProps } from 'react-native-calendars/src/calendar/day';

import { INK_COLOR } from '../../../theme/brand';
import { Pressable, Text, View } from '../../../tw';
import {
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
  isFreeWeekendSpanEnd,
  isFreeWeekendSpanStart,
  resolveInkTextColor,
  resolveShiftColor,
  resolveShiftTextColor,
  resolveVacationBackground,
  resolveVacationTextColor,
  resolveWeekendBackground,
} from '../calendar-day-marker';

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

function weekendSpanPillStyle(
  side: 'start' | 'end',
  backgroundColor: string,
): {
  position: 'absolute';
  top: '50%';
  marginTop: number;
  height: number;
  backgroundColor: string;
  borderCurve: 'continuous';
  borderTopLeftRadius?: number;
  borderBottomLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomRightRadius?: number;
  left?: number;
  right?: number;
} {
  const radius = dayMarkerStyle.borderRadius;
  return {
    position: 'absolute',
    top: '50%',
    marginTop: -CELL_SIZE / 2,
    height: CELL_SIZE,
    backgroundColor,
    borderCurve: 'continuous',
    ...(side === 'start'
      ? {
          left: 0,
          right: -1,
          borderTopLeftRadius: radius,
          borderBottomLeftRadius: radius,
        }
      : {
          left: -1,
          right: 0,
          borderTopRightRadius: radius,
          borderBottomRightRadius: radius,
        }),
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
  const iso = date?.dateString;
  if (iso == null) {
    return <View style={daySlotStyle} />;
  }

  const inactive = state === 'inactive' || state === 'disabled';
  const isToday = iso === markContext.todayIso || state === 'today';
  const label = dayNumber(iso);
  const markKind = getDayMarkKind(iso, markContext);
  const dimming = getMarkDimming(markContext.filter);

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
    const weekendBg = resolveWeekendBackground(dimming.dimFreeWeekends);
    const textColor = resolveShiftTextColor(dimming.dimFreeWeekends);

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
            style={weekendSpanPillStyle('end', weekendBg)}
          />
          {isToday ? (
            <TodayOutline label={label} textColor={textColor} />
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
    const weekendBg = resolveWeekendBackground(dimming.dimFreeWeekends);
    const textColor = resolveShiftTextColor(dimming.dimFreeWeekends);

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
            style={weekendSpanPillStyle('start', weekendBg)}
          />
          {isToday ? (
            <TodayOutline label={label} textColor={textColor} />
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

  if (markKind === 'shift' && !inactive) {
    const shiftColor = markContext.shiftColorByDate.get(iso)!;
    const backgroundColor = resolveShiftColor(
      iso,
      shiftColor,
      dimming.dimShifts,
    );
    const textColor = resolveShiftTextColor(dimming.dimShifts);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {isToday ? (
          <View
            className="items-center justify-center"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderWidth: TODAY_BORDER_WIDTH,
              borderColor: INK_COLOR,
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
    const backgroundColor = resolveVacationBackground(dimming.dimVacations);
    const textColor = resolveVacationTextColor(dimming.dimVacations);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {isToday ? (
          <TodayOutline label={label} textColor={textColor} />
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
    const backgroundColor = resolveWeekendBackground(dimming.dimFreeWeekends);
    const textColor = resolveShiftTextColor(dimming.dimFreeWeekends);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {isToday ? (
          <TodayOutline label={label} textColor={textColor} />
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

  const textColor = resolveInkTextColor(inactive);

  return (
    <DayShell
      disableTouch={disableTouch}
      onPress={handlePress}
      onLongPress={handleLongPress}
      testID={testID}
    >
      {isToday && !inactive ? (
        <TodayOutline label={label} textColor={textColor} />
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
}: {
  label: string;
  textColor: string;
}) {
  return (
    <View
      className="items-center justify-center"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: TODAY_BORDER_WIDTH,
        borderColor: INK_COLOR,
        ...dayMarkerStyle,
      }}
    >
      <Text className="font-mono text-sm" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
