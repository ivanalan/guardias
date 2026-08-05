import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AddRotationScreen } from './screens/add-rotation-screen';
import { ShiftsListScreen } from './screens/shifts-list-screen';

export type ShiftsStackParamList = {
  ShiftsList: undefined;
  AddRotation: undefined;
};

const Stack = createNativeStackNavigator<ShiftsStackParamList>();

/** Native stack for the Shifts tab. */
export function ShiftsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShiftsList"
        component={ShiftsListScreen}
        options={{
          title: t('tabs.shifts'),
        }}
      />
      <Stack.Screen
        name="AddRotation"
        component={AddRotationScreen}
        options={{
          title: t('shifts.addTitle'),
        }}
      />
    </Stack.Navigator>
  );
}
