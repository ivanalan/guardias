import { DEFAULT_ROTATION_COLOR } from '../../features/rotations/rotation-colors';
import { WEEKEND_COLOR } from '../../theme/brand';

/** Mark styles for the month calendar (shift, free weekend, vacation). */
export const CALENDAR_MARK_COLORS = {
  shiftBackground: DEFAULT_ROTATION_COLOR,
  shiftText: '#ffffff',
  freeWeekendBackground: WEEKEND_COLOR,
  freeWeekendText: '#ffffff',
  vacationBackground: '#4A47EF',
  vacationText: '#ffffff',
} as const;
