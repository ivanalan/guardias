import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type { TwoWeekWidgetProps, WidgetDayCellProps } from './types';

/**
 * Fluid-fill calendar — marks stretch with height; week count grows with
 * launcher rows (see resolveTwoWeekLayout). No range title.
 */
const DOT = 4;
const DOT_GAP = 2;
const TODAY_BORDER = 1.5;
const TODAY_INSET = 1.5;
const PAD_X = 10;
const PAD_TOP = 18;
const PAD_BOTTOM = 8;
const WEEKDAY_MB = 6;
const WIDGET_RADIUS = 32;

function DayMark({
  cell,
  cellSize,
  dayFontSize,
}: {
  cell: WidgetDayCellProps;
  cellSize: number;
  dayFontSize: number;
}) {
  const todayRing = cell.isToday && cell.borderColor != null;
  const fill = cell.backgroundColor ?? undefined;
  const markRadius = Math.max(cellSize * 0.28, 5);
  const innerSize = todayRing
    ? cellSize - 2 * (TODAY_BORDER + TODAY_INSET)
    : cellSize;
  const innerRadius = todayRing
    ? markRadius - TODAY_BORDER - TODAY_INSET
    : markRadius;

  const label = (
    <TextWidget
      text={cell.dayNumber}
      style={{
        fontSize: dayFontSize,
        fontWeight: cell.isToday ? '700' : '500',
        color: cell.textColor,
        textAlign: 'center',
      }}
    />
  );

  const filled = (
    <FlexWidget
      style={{
        width: innerSize,
        height: innerSize,
        backgroundColor: fill,
        borderRadius: Math.max(innerRadius, 4),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </FlexWidget>
  );

  if (todayRing) {
    return (
      <FlexWidget
        style={{
          width: cellSize,
          height: cellSize,
          borderWidth: TODAY_BORDER,
          borderColor: cell.borderColor!,
          borderRadius: markRadius,
          padding: TODAY_INSET,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {fill != null ? filled : label}
      </FlexWidget>
    );
  }

  if (fill != null) {
    return filled;
  }

  return (
    <FlexWidget
      style={{
        width: cellSize,
        height: cellSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </FlexWidget>
  );
}

function DayCell({
  cell,
  cellSize,
  dayFontSize,
}: {
  cell: WidgetDayCellProps;
  cellSize: number;
  dayFontSize: number;
}) {
  const hasSecondary = cell.secondaryDotColor != null;

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DayMark cell={cell} cellSize={cellSize} dayFontSize={dayFontSize} />
      {hasSecondary ? (
        <FlexWidget
          style={{
            width: DOT,
            height: DOT,
            marginTop: DOT_GAP,
            borderRadius: DOT / 2,
            backgroundColor: cell.secondaryDotColor!,
          }}
        />
      ) : null}
    </FlexWidget>
  );
}

function WeekRow({
  days,
  cellSize,
  dayFontSize,
}: {
  days: readonly WidgetDayCellProps[];
  cellSize: number;
  dayFontSize: number;
}) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'row',
        width: 'match_parent',
        alignItems: 'center',
      }}
    >
      {days.map((cell, index) => (
        <DayCell
          key={`${cell.dayNumber}-${index}`}
          cell={cell}
          cellSize={cellSize}
          dayFontSize={dayFontSize}
        />
      ))}
    </FlexWidget>
  );
}

/** Fluid-fill multi-week calendar — stretch marks, height-driven week count. */
export function TwoWeekCalendarWidget(props: TwoWeekWidgetProps) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: props.backgroundColor,
        borderRadius: WIDGET_RADIUS,
        paddingHorizontal: PAD_X,
        paddingTop: props.showWeekdayLetters ? PAD_TOP : 10,
        paddingBottom: PAD_BOTTOM,
        flexDirection: 'column',
      }}
    >
      {props.showWeekdayLetters ? (
        <FlexWidget
          style={{
            flexDirection: 'row',
            width: 'match_parent',
            marginBottom: WEEKDAY_MB,
          }}
        >
          {props.weekdayLabels.map((label, index) => (
            <FlexWidget
              key={`${label}-${index}`}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <TextWidget
                text={label}
                style={{
                  fontSize: props.weekdayFontSize,
                  fontWeight: '500',
                  color: props.weekdayColor,
                  textAlign: 'center',
                }}
              />
            </FlexWidget>
          ))}
        </FlexWidget>
      ) : null}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'column',
          width: 'match_parent',
        }}
      >
        {props.weeks.map((days, weekIndex) => (
          <WeekRow
            key={`week-${weekIndex}`}
            days={days}
            cellSize={props.cellSize}
            dayFontSize={props.dayFontSize}
          />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
