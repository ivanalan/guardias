import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { getSecondaryScreenOptions } from '../../navigation/secondary-screen-options';
import { useTheme } from '../../theme/theme-context';
import { AddRotationScreen } from './screens/add-rotation-screen';
import { RotationDetailScreen } from './screens/rotation-detail-screen';
import { ShiftsListScreen } from './screens/shifts-list-screen';
import type { SharedRotationDraft } from './share-rotation-link';

export type ShiftsStackParamList = {
  ShiftsList: undefined;
  AddRotation: { draft?: SharedRotationDraft } | undefined;
  EditRotation: { periodId: string };
  /** `label` avoids flashing the generic “Rotation” title before setOptions. */
  RotationDetail: { periodId: string; label?: string };
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
        options={({ route }) => ({
          title: route.params.label ?? t('shifts.detail.title'),
        })}
      />
    </Stack.Navigator>
  );
}
