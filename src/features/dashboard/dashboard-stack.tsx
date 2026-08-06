import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { Pressable } from '../../tw';
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
    <Stack.Navigator>
      <Stack.Screen
        name="HomeHome"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: t('tabs.home'),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.openA11y')}
              onPress={() => {
                navigation.navigate('Settings');
              }}
              className="px-2 active:opacity-60"
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={24}
                color="#191C1A"
              />
            </Pressable>
          ),
        })}
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
