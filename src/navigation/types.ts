import type { NavigatorScreenParams } from '@react-navigation/native';

import type { CalendarStackParamList } from '../features/calendar/calendar-stack';
import type { DashboardStackParamList } from '../features/dashboard/dashboard-stack';
import type { ShiftsStackParamList } from '../features/rotations/shifts-stack';

/** Root bottom tabs. */
export type TabParamList = {
  Home: NavigatorScreenParams<DashboardStackParamList> | undefined;
  Calendar: NavigatorScreenParams<CalendarStackParamList> | undefined;
  Shifts: NavigatorScreenParams<ShiftsStackParamList> | undefined;
};
