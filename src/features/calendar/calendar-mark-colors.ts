import { BRAND_COLOR } from '../../theme/brand';

/** Mark styles for the month calendar (shift vs free weekend). */
export const CALENDAR_MARK_COLORS = {
  shiftBackground: BRAND_COLOR,
  shiftText: '#ffffff',
  freeWeekendBackground: '#E8F5E9',
  freeWeekendText: '#1B5E20',
} as const;
