import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { getSecondaryScreenOptions } from '../../navigation/secondary-screen-options';
import { useTheme } from '../../theme/theme-context';
import { SettingsScreen } from '../settings/screens/settings-screen';
import { HomeScreen } from './screens/home-screen';

export type DashboardStackParamList = {
  HomeHome: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

/** Native stack for the Home tab (matches Calendar / Shifts header). */
export function DashboardStack() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) =>
        getSecondaryScreenOptions({ navigation, colors })
      }
    >
      <Stack.Screen
        name="HomeHome"
        component={HomeScreen}
        options={{
          title: t('tabs.home'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
        }}
      />
    </Stack.Navigator>
  );
}
