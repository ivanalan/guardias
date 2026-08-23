import { useTheme } from '../../../theme/theme-context';
import { TwoWeekCalendar } from '../../dashboard/components/two-week-calendar';
import { resolveRotationColor } from '../rotation-colors';
import {
  EMPTY_STATE_PREVIEW,
  EMPTY_STATE_PREVIEW_FREE_WEEKEND_DATES,
  EMPTY_STATE_PREVIEW_SHIFT_DATES,
  EMPTY_STATE_PREVIEW_VACATION_DATES,
} from './empty-state-preview-data';

type GhostCalendarPreviewProps = {
  weekdayLabels: readonly string[];
};

/** Sample two-week calendar for the empty-state preview. */
export function GhostCalendarPreview({
  weekdayLabels,
}: GhostCalendarPreviewProps) {
  const { colors } = useTheme();

  return (
    <TwoWeekCalendar
      dates={EMPTY_STATE_PREVIEW.dates}
      weekdayLabels={weekdayLabels}
      todayIso={EMPTY_STATE_PREVIEW.todayIso}
      shiftDates={EMPTY_STATE_PREVIEW_SHIFT_DATES}
      freeWeekendDates={EMPTY_STATE_PREVIEW_FREE_WEEKEND_DATES}
      vacationDates={EMPTY_STATE_PREVIEW_VACATION_DATES}
      shiftColor={resolveRotationColor(EMPTY_STATE_PREVIEW.shiftColor, colors)}
    />
  );
}
