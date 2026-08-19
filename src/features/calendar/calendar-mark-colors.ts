import { BRAND_COLOR, WEEKEND_COLOR } from '../../theme/brand';

/** Mark styles for the month calendar (shift, free weekend, vacation). */
export const CALENDAR_MARK_COLORS = {
  shiftBackground: BRAND_COLOR,
  shiftText: '#ffffff',
  freeWeekendBackground: WEEKEND_COLOR,
  freeWeekendText: '#ffffff',
  vacationBackground: '#F3E8FF',
  vacationText: '#6B21A8',
} as const;
