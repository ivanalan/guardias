import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type { TwoWeekWidgetProps, WidgetDayCellProps } from './types';

/**
 * Density tuned in tools/widget-layout-playground.html (Fill denser inspo):
 * cell 50, title 24, day 20, pad 31/24/28, titleMb 28, weekdayMb 20, weekGap 23.
 * Fixed squares — never stretch with the launcher slot.
 */
const CELL = 40;
const WEEK_GAP = 20;
const DOT = 6;
const DOT_GAP = 4;
const MARK_RADIUS = 14;
const TODAY_BORDER = 1.5;
const TODAY_INSET = 2;
const DAY_FONT = 18;
const WEEKDAY_FONT = 18;
const TITLE_FONT = 22;
const TITLE_MB = 24;
const WEEKDAY_MB = 18;
const PAD_X = 24;
const PAD_TOP = 20;
const PAD_BOTTOM = 20;
const WIDGET_RADIUS = 32;

function DayMark({ cell }: { cell: WidgetDayCellProps }) {
  const todayRing = cell.isToday && cell.borderColor != null;
  const fill = cell.backgroundColor ?? undefined;
  const innerSize = todayRing ? CELL - 2 * (TODAY_BORDER + TODAY_INSET) : CELL;
  const innerRadius = todayRing
    ? MARK_RADIUS - TODAY_BORDER - TODAY_INSET
    : MARK_RADIUS;

  const label = (
    <TextWidget
      text={cell.dayNumber}
      style={{
        fontSize: DAY_FONT,
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
          width: CELL,
          height: CELL,
          borderWidth: TODAY_BORDER,
          borderColor: cell.borderColor!,
          borderRadius: MARK_RADIUS,
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
        width: CELL,
        height: CELL,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </FlexWidget>
  );
}

/**
 * One column: equal flex weight so every day lines up under its weekday.
 * Free-weekend days are separate green squares (not a shared span) so columns
 * stay aligned under M–S headers.
 */
function DayCell({ cell }: { cell: WidgetDayCellProps }) {
  const hasSecondary = cell.secondaryDotColor != null;

  return (
    <FlexWidget
      style={{
        flex: 1,
        height: CELL + (hasSecondary ? DOT + DOT_GAP : 0),
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <DayMark cell={cell} />
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

function WeekRow({ days }: { days: readonly WidgetDayCellProps[] }) {
  const rowHasSecondary = days.some((d) => d.secondaryDotColor != null);
  const rowHeight = CELL + (rowHasSecondary ? DOT + DOT_GAP : 0);

  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        width: 'match_parent',
        height: rowHeight,
        alignItems: 'flex-start',
      }}
    >
      {days.map((cell, index) => (
        <DayCell key={`${cell.dayNumber}-${index}`} cell={cell} />
      ))}
    </FlexWidget>
  );
}

/** Two-week calendar — fixed squares, equal columns, dense type. */
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
        paddingTop: PAD_TOP,
        paddingBottom: PAD_BOTTOM,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <TextWidget
        text={props.title}
        truncate="END"
        maxLines={1}
        style={{
          fontSize: TITLE_FONT,
          fontWeight: '600',
          color: props.titleColor,
          marginBottom: TITLE_MB,
        }}
      />
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
                fontSize: WEEKDAY_FONT,
                fontWeight: '500',
                color: props.weekdayColor,
                textAlign: 'center',
              }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
        <WeekRow days={props.weeks[0]} />
        <FlexWidget style={{ height: WEEK_GAP }} />
        <WeekRow days={props.weeks[1]} />
      </FlexWidget>
    </FlexWidget>
  );
}
