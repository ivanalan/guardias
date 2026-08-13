import { BRAND_COLOR } from '../../theme/brand';

/** Mark styles for the month calendar (shift, free weekend, vacation). */
export const CALENDAR_MARK_COLORS = {
  shiftBackground: BRAND_COLOR,
  shiftText: '#ffffff',
  freeWeekendBackground: '#E8F5E9',
  freeWeekendText: '#1B5E20',
  vacationBackground: '#F3E8FF',
  vacationText: '#6B21A8',
} as const;
