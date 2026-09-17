import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../theme/theme-context';
import { CalendarScreen } from './screens/calendar-screen';
import { DayDetailScreen } from './screens/day-detail-screen';

export type CalendarStackParamList = {
  CalendarHome: undefined;
  DayDetail: { date: string };
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

/** Native stack for the Calendar tab. */
export function CalendarStack() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CalendarHome"
        component={CalendarScreen}
        options={{
          title: t('tabs.calendar'),
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
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </Stack.Navigator>
  );
}
