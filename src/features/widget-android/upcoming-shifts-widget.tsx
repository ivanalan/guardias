import { FlexWidget, TextWidget } from 'react-native-android-widget';

import type {
  UpcomingShiftItemProps,
  UpcomingShiftsWidgetProps,
} from './types';

/**
 * Dense type/rails; trimmed for a 2-row (~140dp) launcher slot.
 * Title matches TwoWeekCalendar (Instrument Serif 32).
 */
const RAIL = 40;
const RAIL_RADIUS = 14;
const RAIL_GAP = 16;
const TITLE_FONT = 32;
const WEEKDAY_FONT = 21;
const RELATIVE_FONT = 16;
const TITLE_MB = 28;
const ROW_GAP = 32;
const PAD_X = 24;
const PAD_TOP = 12;
const PAD_BOTTOM = 12;
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
          fontSize: WEEKDAY_FONT,
          fontWeight: '500',
          color: item.isNext ? onAccentColor : weekdayColor,
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}

function ShiftEntry({
  item,
  props,
}: {
  item: UpcomingShiftItemProps;
  props: UpcomingShiftsWidgetProps;
}) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        flexDirection: 'row',
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
            fontWeight: '500',
            color: item.isNext ? props.accentColor : props.weekdayColor,
          }}
        />
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
      </FlexWidget>
    </FlexWidget>
  );
}

/** Equal columns: flex maps to weight only; width 0 is required (wrap_content + weight follows text). */
function ShiftRow({
  left,
  right,
  props,
}: {
  left: UpcomingShiftItemProps | null;
  right: UpcomingShiftItemProps | null;
  props: UpcomingShiftsWidgetProps;
}) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        width: 'match_parent',
        alignItems: 'center',
      }}
    >
      <FlexWidget style={{ flex: 1, width: 0 }}>
        {left != null ? <ShiftEntry item={left} props={props} /> : null}
      </FlexWidget>
      <FlexWidget style={{ flex: 1, width: 0 }}>
        {right != null ? <ShiftEntry item={right} props={props} /> : null}
      </FlexWidget>
    </FlexWidget>
  );
}

/** Upcoming guardias — 2×2 rails, next shift highlighted. */
export function UpcomingShiftsWidget(props: UpcomingShiftsWidgetProps) {
  const row0 = props.items[0] ?? null;
  const row1 = props.items[1] ?? null;
  const row2 = props.items[2] ?? null;
  const row3 = props.items[3] ?? null;
  const hasItems = props.items.length > 0;

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
          fontFamily: 'InstrumentSerif_400Regular',
          color: props.titleColor,
          marginBottom: TITLE_MB,
        }}
      />
      {hasItems ? (
        <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
          <ShiftRow left={row0} right={row1} props={props} />
          <FlexWidget style={{ height: ROW_GAP }} />
          <ShiftRow left={row2} right={row3} props={props} />
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
          }}
        />
      )}
    </FlexWidget>
  );
}
