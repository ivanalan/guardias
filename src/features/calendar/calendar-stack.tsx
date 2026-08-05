import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { CalendarScreen } from './screens/calendar-screen';
import { DayDetailStubScreen } from './screens/day-detail-stub-screen';

export type CalendarStackParamList = {
  CalendarHome: undefined;
  DayDetailStub: { date: string };
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

/** Native stack for the Calendar tab. */
export function CalendarStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CalendarHome"
        component={CalendarScreen}
        options={{
          title: t('tabs.calendar'),
        }}
      />
      <Stack.Screen
        name="DayDetailStub"
        component={DayDetailStubScreen}
        options={{
          title: t('calendar.dayDetailTitle'),
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
        }}
      />
    </Stack.Navigator>
  );
}
