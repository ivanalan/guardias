import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type {
  UpcomingShiftItemProps,
  UpcomingShiftsWidgetProps,
} from './types';

/**
 * 1-column timeline rail for a default 2×2 slot.
 * Rows flex-fill the widget height; layout helper sets row count.
 */
const RAIL = 34;
const RAIL_RADIUS = 10;
const RAIL_GAP = 12;
const RAIL_FONT = 14;
const WEEKDAY_FONT = 14;
const RELATIVE_FONT = 12;
const WEEKDAY_MB = 2;
const DIVIDER_H = 1;
const PAD_X = 14;
const PAD_TOP = 8;
const PAD_BOTTOM = 8;
const WIDGET_RADIUS = 32;

function ShiftRail({
  item,
  accentColor,
  railMutedColor,
  onAccentColor,
  weekdayColor,
}: {
  item: UpcomingShiftItemProps;
  accentColor: UpcomingShiftsWidgetProps['accentColor'];
  railMutedColor: UpcomingShiftsWidgetProps['railMutedColor'];
  onAccentColor: UpcomingShiftsWidgetProps['onAccentColor'];
  weekdayColor: UpcomingShiftsWidgetProps['weekdayColor'];
}) {
  return (
    <FlexWidget
      style={{
        width: RAIL,
        height: RAIL,
        backgroundColor: item.isNext ? accentColor : railMutedColor,
        borderRadius: RAIL_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TextWidget
        text={item.dayNumber}
        style={{
          fontSize: RAIL_FONT,
          fontWeight: item.isNext ? '700' : '500',
          color: item.isNext ? onAccentColor : weekdayColor,
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}

function ShiftRow({
  item,
  props,
  showRelative,
  showDivider,
}: {
  item: UpcomingShiftItemProps;
  props: UpcomingShiftsWidgetProps;
  showRelative: boolean;
  showDivider: boolean;
}) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        width: 'match_parent',
      }}
    >
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'row',
          width: 'match_parent',
          alignItems: 'center',
        }}
      >
        <ShiftRail
          item={item}
          accentColor={props.accentColor}
          railMutedColor={props.railMutedColor}
          onAccentColor={props.onAccentColor}
          weekdayColor={props.weekdayColor}
        />
        <FlexWidget
          style={{
            flex: 1,
            width: 0,
            flexDirection: 'column',
            marginLeft: RAIL_GAP,
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text={item.weekday}
            truncate="END"
            maxLines={1}
            style={{
              fontSize: WEEKDAY_FONT,
              fontWeight: item.isNext ? '600' : '500',
              color: props.weekdayColor,
              marginBottom: showRelative ? WEEKDAY_MB : 0,
            }}
          />
          {showRelative ? (
            <TextWidget
              text={item.relativeLabel}
              truncate="END"
              maxLines={1}
              style={{
                fontSize: RELATIVE_FONT,
                fontWeight: '400',
                color: props.relativeColor,
              }}
            />
          ) : null}
        </FlexWidget>
      </FlexWidget>
      {showDivider ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            height: DIVIDER_H,
            backgroundColor: props.railMutedColor,
          }}
        />
      ) : null}
    </FlexWidget>
  );
}

/** Upcoming guardias — vertical timeline, next shift highlighted. */
export function UpcomingShiftsWidget(props: UpcomingShiftsWidgetProps) {
  const visible = props.items.slice(0, props.maxItems);
  const hasItems = visible.length > 0;

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
        justifyContent: hasItems ? 'flex-start' : 'center',
      }}
    >
      {hasItems ? (
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: 'column',
            width: 'match_parent',
          }}
        >
          {visible.map((item, index) => (
            <ShiftRow
              key={`${item.dayNumber}-${item.weekday}-${index}`}
              item={item}
              props={props}
              showRelative={props.showRelative}
              showDivider={index < visible.length - 1}
            />
          ))}
        </FlexWidget>
      ) : (
        <TextWidget
          text={props.emptyCaption}
          truncate="END"
          maxLines={2}
          style={{
            fontSize: WEEKDAY_FONT,
            fontWeight: '400',
            color: props.emptyCaptionColor,
            textAlign: 'center',
          }}
        />
      )}
    </FlexWidget>
  );
}
