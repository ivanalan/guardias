import { HStack, Rectangle, Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { type WidgetEnvironment } from 'expo-widgets';

import { registerWidget } from './register-widget';

type HexColor = `#${string}`;

type DayCell = {
  dayNumber: string;
  isToday: boolean;
  backgroundColor: HexColor | null;
  textColor: HexColor;
  borderColor: HexColor | null;
  secondaryDotColor: HexColor | null;
};

type TwoWeekData = {
  backgroundColor: HexColor;
  weekdayLabels: readonly string[];
  weekdayColor: HexColor;
  weeks: readonly (readonly DayCell[])[];
  cellSize: number;
  dayFontSize: number;
  weekdayFontSize: number;
  showWeekdayLetters: boolean;
};

/** Theme bundle pushed from the app — widget picks light/dark at render time. */
export type TwoWeekCalendarIosProps = {
  light: TwoWeekData;
  dark: TwoWeekData;
  forcedScheme: 'light' | 'dark' | null;
};

/**
 * iOS Two-Week Calendar home-screen widget (matches Android fluid calendar).
 * Compact weekday header; week rows equally share the remaining height.
 */
const TwoWeekCalendarLayout = (
  props: TwoWeekCalendarIosProps,
  environment: WidgetEnvironment,
) => {
  'widget';

  const DOT = 4;
  const DOT_GAP = 2;
  const TODAY_BORDER = 1;
  const TODAY_INSET = 1;
  const PAD = 14;
  // Week rows share leftover height (Android weeks flex:1). Header stays
  // compact — intrinsic height, not equal flex with the calendar rows.
  const flexFill = frame({ maxWidth: 9999, maxHeight: 9999 });
  const flexCol = frame({ maxWidth: 9999 });

  const scheme =
    props.forcedScheme ??
    (environment.colorScheme === 'dark' ? 'dark' : 'light');
  const data = scheme === 'dark' ? props.dark : props.light;

  const family = environment.widgetFamily;
  const weekCount =
    family === 'systemLarge' ? Math.min(4, data.weeks.length) : 2;
  const weeks = data.weeks.slice(0, weekCount);
  const showWeekdayLetters =
    data.showWeekdayLetters && family !== 'systemSmall';
  const cellSize =
    family === 'systemLarge' ? Math.max(data.cellSize, 28) : data.cellSize;
  const dayFontSize =
    family === 'systemLarge'
      ? Math.max(data.dayFontSize, 13)
      : data.dayFontSize;
  const weekdayFontSize = data.weekdayFontSize;

  return (
    <VStack
      alignment="center"
      spacing={0}
      modifiers={[
        containerBackground(data.backgroundColor, 'widget'),
        frame({ maxWidth: 9999, maxHeight: 9999 }),
      ]}
    >
      <VStack
        alignment="center"
        spacing={0}
        modifiers={[
          padding({ all: PAD }),
          frame({ maxWidth: 9999, maxHeight: 9999 }),
        ]}
      >
        {showWeekdayLetters ? (
          <HStack
            spacing={0}
            alignment="center"
            modifiers={[
              frame({ maxWidth: 9999 }),
              padding({ top: 4, bottom: 8 }),
            ]}
          >
            {data.weekdayLabels.map((label, index) => (
              <VStack
                key={`${label}-${index}`}
                alignment="center"
                modifiers={[flexCol]}
              >
                <Text
                  modifiers={[
                    font({ size: weekdayFontSize, weight: 'medium' }),
                    foregroundStyle(data.weekdayColor),
                  ]}
                >
                  {label}
                </Text>
              </VStack>
            ))}
          </HStack>
        ) : null}
        <VStack
          alignment="center"
          spacing={0}
          modifiers={[flexFill]}
        >
          {weeks.map((days, weekIndex) => (
            <HStack
              key={`week-${weekIndex}`}
              alignment="center"
              spacing={0}
              modifiers={[flexFill]}
            >
              {days.map((cell, index) => {
            const todayRing = cell.isToday && cell.borderColor != null;
            const markRadius = Math.max(cellSize * 0.28, 5);
            const fill = cell.backgroundColor;
            const innerSize = todayRing
              ? cellSize - 2 * (TODAY_BORDER + TODAY_INSET)
              : cellSize;
            const innerRadius = todayRing
              ? Math.max(markRadius - TODAY_BORDER - TODAY_INSET, 4)
              : markRadius;

            const label = (
              <Text
                modifiers={[
                  font({
                    size: dayFontSize,
                    weight: cell.isToday ? 'bold' : 'medium',
                  }),
                  foregroundStyle(cell.textColor),
                ]}
              >
                {cell.dayNumber}
              </Text>
            );

            const inner =
              fill != null ? (
                <VStack
                  alignment="center"
                  modifiers={[
                    frame({ width: innerSize, height: innerSize }),
                    background(
                      fill,
                      shapes.roundedRectangle({ cornerRadius: innerRadius }),
                    ),
                  ]}
                >
                  {label}
                </VStack>
              ) : (
                <VStack
                  alignment="center"
                  modifiers={[frame({ width: innerSize, height: innerSize })]}
                >
                  {label}
                </VStack>
              );

            const mark =
              todayRing && cell.borderColor != null ? (
                <VStack
                  alignment="center"
                  modifiers={[
                    frame({ width: cellSize, height: cellSize }),
                    background(
                      cell.borderColor,
                      shapes.roundedRectangle({ cornerRadius: markRadius }),
                    ),
                    padding({ all: TODAY_BORDER + TODAY_INSET }),
                  ]}
                >
                  {fill != null ? (
                    <VStack
                      alignment="center"
                      modifiers={[
                        frame({ width: innerSize, height: innerSize }),
                        background(
                          fill,
                          shapes.roundedRectangle({
                            cornerRadius: innerRadius,
                          }),
                        ),
                      ]}
                    >
                      {label}
                    </VStack>
                  ) : (
                    <VStack
                      alignment="center"
                      modifiers={[
                        frame({ width: innerSize, height: innerSize }),
                        background(
                          data.backgroundColor,
                          shapes.roundedRectangle({
                            cornerRadius: innerRadius,
                          }),
                        ),
                      ]}
                    >
                      {label}
                    </VStack>
                  )}
                </VStack>
              ) : (
                inner
              );

            return (
              <VStack
                key={`${cell.dayNumber}-${index}`}
                alignment="center"
                spacing={cell.secondaryDotColor != null ? DOT_GAP : 0}
                modifiers={[flexCol]}
              >
                {mark}
                {cell.secondaryDotColor != null ? (
                  <Rectangle
                    modifiers={[
                      frame({ width: DOT, height: DOT }),
                      background(
                        cell.secondaryDotColor,
                        shapes.roundedRectangle({ cornerRadius: DOT / 2 }),
                      ),
                    ]}
                  />
                ) : null}
              </VStack>
            );
          })}
        </HStack>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
};

export default registerWidget('TwoWeekCalendar', TwoWeekCalendarLayout);
