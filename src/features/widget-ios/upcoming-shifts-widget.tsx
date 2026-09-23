import { Divider, HStack, Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  containerBackground,
  containerRelativeFrame,
  font,
  foregroundStyle,
  frame,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { type WidgetEnvironment } from 'expo-widgets';

import { registerWidget } from './register-widget';

type HexColor = `#${string}`;

type UpcomingShiftItem = {
  dayNumber: string;
  weekday: string;
  relativeLabel: string;
  isNext: boolean;
};

type UpcomingShiftsData = {
  backgroundColor: HexColor;
  emptyCaption: string;
  emptyCaptionColor: HexColor;
  items: readonly UpcomingShiftItem[];
  maxItems: number;
  showRelative: boolean;
  accentColor: HexColor;
  railMutedColor: HexColor;
  onAccentColor: HexColor;
  weekdayColor: HexColor;
  relativeColor: HexColor;
};

/** Theme bundle pushed from the app — widget picks light/dark at render time. */
export type UpcomingShiftsIosProps = {
  light: UpcomingShiftsData;
  dark: UpcomingShiftsData;
  forcedScheme: 'light' | 'dark' | null;
};

/**
 * iOS Upcoming Shifts home-screen widget (matches Android timeline design).
 * Layout body is stringified by the babel widgets plugin for WidgetKit.
 */
const UpcomingShiftsLayout = (
  props: UpcomingShiftsIosProps,
  environment: WidgetEnvironment,
) => {
  'widget';

  const PAD_X = 14;
  const PAD_Y = 8;
  const RAIL_GAP = 12;

  const scheme =
    props.forcedScheme ??
    (environment.colorScheme === 'dark' ? 'dark' : 'light');
  const data = scheme === 'dark' ? props.dark : props.light;

  const family = environment.widgetFamily;
  const isSmall = family === 'systemSmall';
  const maxItems =
    family === 'systemLarge' ? 6 : family === 'systemMedium' ? 4 : 3;
  const showRelative = data.showRelative;
  const visible = data.items.slice(0, Math.min(maxItems, data.maxItems));
  const hasItems = visible.length > 0;
  const rowCount = Math.max(visible.length, 1);

  // Slightly tighter chrome when packing 3 equal rows into systemSmall.
  const RAIL = isSmall ? 28 : 34;
  const RAIL_RADIUS = isSmall ? 8 : 10;
  const RAIL_FONT = isSmall ? 13 : 14;
  const WEEKDAY_FONT = isSmall ? 13 : 14;
  const RELATIVE_FONT = isSmall ? 11 : 12;

  return (
    <VStack
      alignment={hasItems ? 'leading' : 'center'}
      spacing={0}
      modifiers={[
        containerBackground(data.backgroundColor, 'widget'),
        padding({ horizontal: PAD_X, vertical: PAD_Y }),
        frame({ maxWidth: 9999, maxHeight: 9999, alignment: 'leading' }),
      ]}
    >
      {hasItems
        ? visible.map((item, index) => (
            <VStack
              key={`${item.dayNumber}-${item.weekday}-${index}`}
              alignment="leading"
              spacing={0}
              modifiers={[
                containerRelativeFrame({
                  axes: 'vertical',
                  count: rowCount,
                  span: 1,
                  alignment: 'leading',
                }),
                frame({ maxWidth: 9999 }),
              ]}
            >
              <HStack
                alignment="center"
                spacing={RAIL_GAP}
                modifiers={[
                  frame({
                    maxWidth: 9999,
                    maxHeight: 9999,
                    alignment: 'leading',
                  }),
                ]}
              >
                <VStack
                  alignment="center"
                  modifiers={[
                    frame({ width: RAIL, height: RAIL }),
                    background(
                      item.isNext ? data.accentColor : data.railMutedColor,
                      shapes.roundedRectangle({ cornerRadius: RAIL_RADIUS }),
                    ),
                  ]}
                >
                  <Text
                    modifiers={[
                      font({
                        size: RAIL_FONT,
                        weight: item.isNext ? 'bold' : 'medium',
                      }),
                      foregroundStyle(
                        item.isNext ? data.onAccentColor : data.weekdayColor,
                      ),
                    ]}
                  >
                    {item.dayNumber}
                  </Text>
                </VStack>
                <VStack alignment="leading" spacing={showRelative ? 2 : 0}>
                  <Text
                    modifiers={[
                      font({
                        size: WEEKDAY_FONT,
                        weight: item.isNext ? 'semibold' : 'medium',
                      }),
                      foregroundStyle(data.weekdayColor),
                    ]}
                  >
                    {item.weekday}
                  </Text>
                  {showRelative ? (
                    <Text
                      modifiers={[
                        font({ size: RELATIVE_FONT, weight: 'regular' }),
                        foregroundStyle(data.relativeColor),
                      ]}
                    >
                      {item.relativeLabel}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
              {index < visible.length - 1 ? (
                <Divider
                  modifiers={[foregroundStyle(data.railMutedColor)]}
                />
              ) : null}
            </VStack>
          ))
        : (
          <Text
            modifiers={[
              font({ size: WEEKDAY_FONT, weight: 'regular' }),
              foregroundStyle(data.emptyCaptionColor),
            ]}
          >
            {data.emptyCaption}
          </Text>
        )}
    </VStack>
  );
};

export default registerWidget('UpcomingShifts', UpcomingShiftsLayout);
