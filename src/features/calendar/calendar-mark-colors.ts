import { DEFAULT_ROTATION_COLOR } from '../../features/rotations/rotation-colors';
import type { ThemeColors } from '../../theme/colors';

export type CalendarMarkColors = {
  shiftBackground: string;
  shiftText: string;
  freeWeekendBackground: string;
  freeWeekendText: string;
  vacationBackground: string;
  vacationText: string;
};

/** Mark styles for the month calendar (shift, free weekend, vacation). */
export function calendarMarkColorsFor(colors: ThemeColors): CalendarMarkColors {
  return {
    shiftBackground: DEFAULT_ROTATION_COLOR,
    shiftText: colors.onColor,
    freeWeekendBackground: colors.bgWeekend,
    freeWeekendText: colors.onColor,
    vacationBackground: colors.bgVacation,
    vacationText: colors.onColor,
  };
}
