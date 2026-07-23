import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ShiftsListScreen } from './screens/shifts-list-screen';

const Stack = createNativeStackNavigator();
const isIos = process.env.EXPO_OS === 'ios';

/** Native stack for the Shifts tab — large title is iOS-only. */
export function ShiftsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShiftsList"
        component={ShiftsListScreen}
        options={{
          title: t('tabs.shifts'),
          headerLargeTitle: isIos,
          ...(isIos
            ? {
                unstable_headerRightItems: () => [
                  {
                    type: 'button' as const,
                    label: t('shifts.addA11y'),
                    icon: { type: 'sfSymbol' as const, name: 'plus' as const },
                    onPress: () => Alert.alert(t('shifts.comingSoon')),
                  },
                ],
              }
            : null),
        }}
      />
    </Stack.Navigator>
  );
}
