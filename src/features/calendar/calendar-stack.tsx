import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CalendarScreen } from './screens/calendar-screen';
import { DayDetailScreen } from './screens/day-detail-screen';

export type CalendarStackParamList = {
  CalendarHome: undefined;
  DayDetail: { date: string };
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

/** Native stack for the Calendar tab. */
export function CalendarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CalendarHome"
        component={CalendarScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DayDetail"
        component={DayDetailScreen}
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
        }}
      />
    </Stack.Navigator>
  );
}
