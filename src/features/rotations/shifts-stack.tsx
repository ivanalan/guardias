import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { secondaryScreenOptions } from '../../navigation/secondary-screen-options';
import { AddRotationScreen } from './screens/add-rotation-screen';
import { RotationDetailScreen } from './screens/rotation-detail-screen';
import { ShiftsListScreen } from './screens/shifts-list-screen';

export type ShiftsStackParamList = {
  ShiftsList: undefined;
  AddRotation: undefined;
  EditRotation: { periodId: string };
  RotationDetail: { periodId: string };
};

const Stack = createNativeStackNavigator<ShiftsStackParamList>();

/** Native stack for the Shifts tab. */
export function ShiftsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={secondaryScreenOptions}>
      <Stack.Screen
        name="ShiftsList"
        component={ShiftsListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddRotation"
        component={AddRotationScreen}
        options={{
          title: t('shifts.addTitle'),
        }}
      />
      <Stack.Screen
        name="EditRotation"
        component={AddRotationScreen}
        options={{
          title: t('shifts.editTitle'),
        }}
      />
      <Stack.Screen
        name="RotationDetail"
        component={RotationDetailScreen}
        options={{
          title: t('shifts.detail.title'),
        }}
      />
    </Stack.Navigator>
  );
}
