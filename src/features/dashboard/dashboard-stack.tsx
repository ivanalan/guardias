import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

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

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="HomeHome"
        component={HomeScreen}
        options={{
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
