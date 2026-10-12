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
  SECONDARY_DAY_DOT_CAP,
  SECONDARY_DOT_GAP,
  SECONDARY_DOT_SIZE,
  SECONDARY_DOT_STACK_HEIGHT,
  SECONDARY_OVERFLOW_LABEL_LINE_HEIGHT,
  TODAY_BORDER_WIDTH,
  TODAY_INNER_GAP,
  type CalendarDayMarkContext,
  type SecondaryDayDot,
  dayMarkerStyle,
  dayNumber,
  getDayMarkKind,
  isCalendarDatePast,
  isDayDimmedByFilter,
  isFreeWeekendSpanEnd,
  isFreeWeekendSpanStart,
  markColorAlpha,
  resolveInkTextColor,
  resolveShiftColor,
  resolveShiftTextColor,
  resolveVacationBackground,
  resolveVacationTextColor,
  resolveWeekendBackground,
  shiftMarkColorAlpha,
  visibleSecondaryDotsForDay,
  withAlpha,
} from '../calendar-day-marker';
import { calendarMarkColorsFor } from '../calendar-mark-colors';

type CalendarDayProps = DayProps & {
  date?: DateData;
};

const dayRowPaddingTop = CALENDAR_WEEK_ROW_GAP / 2;
const dayRowPaddingBottom =
  CALENDAR_WEEK_ROW_GAP / 2 + SECONDARY_DOT_STACK_HEIGHT;

const daySlotStyle = {
  alignSelf: 'stretch' as const,
  alignItems: 'center' as const,
  justifyContent: 'flex-start' as const,
  minHeight: CELL_SIZE + SECONDARY_DOT_STACK_HEIGHT + CALENDAR_WEEK_ROW_GAP,
  paddingTop: dayRowPaddingTop,
  paddingBottom: dayRowPaddingBottom,
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
    // Saturday marker left: this cell’s center minus half CELL_SIZE.
    left: '50%' as const,
    marginLeft: -CELL_SIZE / 2,
    // Sunday marker right: 50% into Sunday plus half CELL_SIZE.
    right: '-50%' as const,
    marginRight: -CELL_SIZE / 2,
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
  const isSelected = markContext.selectedIso === iso;
  const showRing = !inactive && (isToday || isSelected);
  const label = dayNumber(iso);
  const markKind = getDayMarkKind(iso, markContext);
  const isPast = isCalendarDatePast(iso, markContext.todayIso);
  const hasPrimary = markContext.shiftColorByDate.has(iso);
  const secondaryDotsOnDay =
    markContext.secondaryDotsByDate.get(iso) ?? EMPTY_SECONDARY_DOTS;
  const visibleSecondaryDots = visibleSecondaryDotsForDay(
    secondaryDotsOnDay,
    markContext.filter,
  );
  const dimmedByFilter = isDayDimmedByFilter(
    markContext.filter,
    {
      hasPrimary,
      secondaryPeriodIds: secondaryDotsOnDay.map((dot) => dot.periodId),
      markKind,
    },
    {
      inactive,
      iso,
      visibleMonthKey: markContext.visibleMonthKey,
    },
  );
  const labelAlpha = markColorAlpha(dimmedByFilter, isPast);
  const secondaryDot =
    !inactive && visibleSecondaryDots.length > 0 ? (
      <SecondaryDotRow
        dots={visibleSecondaryDots}
        dimmed={dimmedByFilter}
        isPast={isPast}
        inkColor={colors.text}
      />
    ) : null;

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
    // Background comes from Saturday’s spanning pill; keep this cell above it.
    const textColor = resolveShiftTextColor(markColors, labelAlpha);

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
          {showRing ? (
            <TodayOutline
              label={label}
              textColor={textColor}
              inkColor={colors.brand}
              secondaryDot={secondaryDot}
            />
          ) : (
            <DayLabelBox
              textColor={textColor}
              label={label}
              secondaryDot={secondaryDot}
            />
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
    const weekendAlpha = markColorAlpha(dimmedByFilter, weekendPast);
    const weekendBg = resolveWeekendBackground(markColors, weekendAlpha);
    const textColor = resolveShiftTextColor(markColors, labelAlpha);

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
          <View pointerEvents="none" style={weekendSpanPillStyle(weekendBg)} />
          {showRing ? (
            <View style={{ zIndex: 1 }}>
              <TodayOutline
                label={label}
                textColor={textColor}
                inkColor={colors.brand}
                secondaryDot={secondaryDot}
              />
            </View>
          ) : (
            <View style={{ zIndex: 1 }}>
              <DayLabelBox
                textColor={textColor}
                label={label}
                secondaryDot={secondaryDot}
              />
            </View>
          )}
        </Pressable>
      </View>
    );
  }

  if (markKind === 'shift' && !inactive) {
    const shiftColor = markContext.shiftColorByDate.get(iso)!;
    const shiftAlpha = shiftMarkColorAlpha(
      dimmedByFilter,
      isPast,
      iso,
      markContext.patternAnchorDate,
    );
    const backgroundColor = resolveShiftColor(shiftColor, shiftAlpha);
    const textColor = resolveShiftTextColor(markColors, labelAlpha);
    const isPatternAnchor = markContext.patternAnchorDate === iso;

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {showRing || isPatternAnchor ? (
          <TodayFilledMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            inkColor={colors.brand}
            secondaryDot={secondaryDot}
          />
        ) : (
          <FilledDayMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            secondaryDot={secondaryDot}
          />
        )}
      </DayShell>
    );
  }

  if (markKind === 'vacation' && !inactive) {
    const vacationAlpha = markColorAlpha(dimmedByFilter, isPast);
    const backgroundColor = resolveVacationBackground(
      markColors,
      vacationAlpha,
    );
    const textColor = resolveVacationTextColor(markColors, labelAlpha);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {showRing ? (
          <TodayFilledMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            inkColor={colors.brand}
            secondaryDot={secondaryDot}
          />
        ) : (
          <FilledDayMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            secondaryDot={secondaryDot}
          />
        )}
      </DayShell>
    );
  }

  if (markKind === 'freeWeekend' && !inactive) {
    const weekendAlpha = markColorAlpha(dimmedByFilter, isPast);
    const backgroundColor = resolveWeekendBackground(markColors, weekendAlpha);
    const textColor = resolveShiftTextColor(markColors, labelAlpha);

    return (
      <DayShell
        disableTouch={disableTouch}
        onPress={handlePress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {showRing ? (
          <TodayFilledMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            inkColor={colors.brand}
            secondaryDot={secondaryDot}
          />
        ) : (
          <FilledDayMarker
            label={label}
            backgroundColor={backgroundColor}
            textColor={textColor}
            secondaryDot={secondaryDot}
          />
        )}
      </DayShell>
    );
  }

  const textColor = inactive
    ? resolveInkTextColor(colors.text, true)
    : labelAlpha < 1
      ? withAlpha(colors.text, labelAlpha)
      : colors.text;
  const struckThrough =
    !inactive && markKind === 'none' && markContext.skippedSet.has(iso);

  return (
    <DayShell
      disableTouch={disableTouch}
      onPress={handlePress}
      onLongPress={handleLongPress}
      testID={testID}
    >
      {showRing ? (
        <TodayOutline
          label={label}
          textColor={textColor}
          inkColor={colors.brand}
          secondaryDot={secondaryDot}
          struckThrough={struckThrough}
        />
      ) : (
        <DayLabelBox
          textColor={textColor}
          label={label}
          secondaryDot={inactive ? null : secondaryDot}
          struckThrough={struckThrough}
        />
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

/** Keeps the day fill at CELL_SIZE and parks the friend dot fully below it. */
function DayMarkWithSecondaryDot({
  children,
  secondaryDot,
}: {
  children: ReactNode;
  secondaryDot: ReactNode;
}) {
  return (
    <View
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        alignItems: 'center',
      }}
    >
      {children}
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
  );
}

function DayLabelBox({
  label,
  textColor,
  secondaryDot,
  struckThrough = false,
}: {
  label: string;
  textColor: string;
  secondaryDot: ReactNode;
  struckThrough?: boolean;
}) {
  return (
    <DayMarkWithSecondaryDot secondaryDot={secondaryDot}>
      <View style={dayMarkerBoxStyle}>
        <Text
          className="font-mono text-sm"
          style={{
            color: textColor,
            textDecorationLine: struckThrough ? 'line-through' : 'none',
          }}
        >
          {label}
        </Text>
      </View>
    </DayMarkWithSecondaryDot>
  );
}

function FilledDayMarker({
  label,
  backgroundColor,
  textColor,
  secondaryDot,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
  secondaryDot: ReactNode;
}) {
  return (
    <DayMarkWithSecondaryDot secondaryDot={secondaryDot}>
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
    </DayMarkWithSecondaryDot>
  );
}

const EMPTY_SECONDARY_DOTS: readonly SecondaryDayDot[] = [];

function SecondaryDot({
  color,
  dimmed,
  isPast,
}: {
  color: string;
  dimmed: boolean;
  isPast: boolean;
}) {
  const alpha = markColorAlpha(dimmed, isPast);
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

function SecondaryDotRow({
  dots,
  dimmed,
  isPast,
  inkColor,
}: {
  dots: readonly SecondaryDayDot[];
  dimmed: boolean;
  isPast: boolean;
  inkColor: string;
}) {
  const shown = dots.slice(0, SECONDARY_DAY_DOT_CAP);
  const extra = dots.length - shown.length;
  const overflowAlpha = markColorAlpha(dimmed, isPast);
  return (
    <View
      pointerEvents="none"
      className="flex-row items-center"
      style={{ gap: 2 }}
    >
      {shown.map((dot) => (
        <SecondaryDot
          key={dot.periodId}
          color={dot.color}
          dimmed={dimmed}
          isPast={isPast}
        />
      ))}
      {extra > 0 ? (
        <Text
          className="font-mono"
          style={{
            fontSize: 8,
            lineHeight: SECONDARY_OVERFLOW_LABEL_LINE_HEIGHT,
            color:
              overflowAlpha < 1 ? withAlpha(inkColor, overflowAlpha) : inkColor,
          }}
        >
          +{extra}
        </Text>
      ) : null}
    </View>
  );
}

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
  secondaryDot,
  struckThrough = false,
}: {
  label: string;
  textColor: string;
  inkColor: string;
  secondaryDot?: ReactNode;
  struckThrough?: boolean;
}) {
  return (
    <DayMarkWithSecondaryDot secondaryDot={secondaryDot}>
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
        <Text
          className="font-mono text-sm"
          style={{
            color: textColor,
            textDecorationLine: struckThrough ? 'line-through' : 'none',
          }}
        >
          {label}
        </Text>
      </View>
    </DayMarkWithSecondaryDot>
  );
}

function TodayFilledMarker({
  label,
  backgroundColor,
  textColor,
  inkColor,
  secondaryDot,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
  inkColor: string;
  secondaryDot?: ReactNode;
}) {
  return (
    <DayMarkWithSecondaryDot secondaryDot={secondaryDot}>
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
    </DayMarkWithSecondaryDot>
  );
}
