import { TwoWeekCalendar } from '../../dashboard/components/two-week-calendar';
import {
  EMPTY_STATE_PREVIEW,
  EMPTY_STATE_PREVIEW_FREE_WEEKEND_DATES,
  EMPTY_STATE_PREVIEW_SHIFT_COLOR_BY_DATE,
  EMPTY_STATE_PREVIEW_VACATION_DATES,
} from './empty-state-preview-data';

type GhostCalendarPreviewProps = {
  weekdayLabels: readonly string[];
};

/** Sample two-week calendar for the empty-state preview. */
export function GhostCalendarPreview({
  weekdayLabels,
}: GhostCalendarPreviewProps) {
  return (
    <TwoWeekCalendar
      dates={EMPTY_STATE_PREVIEW.dates}
      weekdayLabels={weekdayLabels}
      todayIso={EMPTY_STATE_PREVIEW.todayIso}
      shiftColorByDate={EMPTY_STATE_PREVIEW_SHIFT_COLOR_BY_DATE}
      secondaryShiftColorByDate={new Map()}
      freeWeekendDates={EMPTY_STATE_PREVIEW_FREE_WEEKEND_DATES}
      vacationDates={EMPTY_STATE_PREVIEW_VACATION_DATES}
    />
  );
}
