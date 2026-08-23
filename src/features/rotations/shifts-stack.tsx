import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { getSecondaryScreenOptions } from '../../navigation/secondary-screen-options';
import { useTheme } from '../../theme/theme-context';
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
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) =>
        getSecondaryScreenOptions({ navigation, colors })
      }
    >
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
          headerBackButtonMenuEnabled: false,
        }}
      />
      <Stack.Screen
        name="EditRotation"
        component={AddRotationScreen}
        options={{
          title: t('shifts.editTitle'),
          headerBackButtonMenuEnabled: false,
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
