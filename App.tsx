import './src/global.css';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { I18nextProvider, useTranslation } from 'react-i18next';
import type { ComponentProps } from 'react';

import i18n from './src/i18n';
import { CalendarStack } from './src/features/calendar/calendar-stack';
import { DashboardStack } from './src/features/dashboard/dashboard-stack';
import { RotationsProvider } from './src/features/rotations/rotations-context';
import { PreferencesProvider } from './src/features/settings/preferences-context';
import { ShiftsStack } from './src/features/rotations/shifts-stack';
import type { TabParamList } from './src/navigation/types';
import { BRAND_COLOR } from './src/theme/brand';

type TabKey = keyof TabParamList;
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<TabKey, { focused: IconName; unfocused: IconName }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Calendar: { focused: 'calendar', unfocused: 'calendar-outline' },
  Shifts: { focused: 'clipboard-list', unfocused: 'clipboard-list-outline' },
};

/** Route name (stable id) → catalog key for the tab label */
const tabTitleKeys: Record<
  TabKey,
  'tabs.home' | 'tabs.calendar' | 'tabs.shifts'
> = {
  Home: 'tabs.home',
  Calendar: 'tabs.calendar',
  Shifts: 'tabs.shifts',
};

function RootNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: BRAND_COLOR,
          tabBarInactiveTintColor: '#49454F',
          tabBarLabel: t(tabTitleKeys[route.name]),
          tabBarIcon: ({ focused, color, size }) => {
            const icons = tabIcons[route.name];
            return (
              <MaterialCommunityIcons
                name={focused ? icons.focused : icons.unfocused}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        {/* `name` is a route id — keep stable; translate via tabBarLabel */}
        <Tab.Screen name="Home" component={DashboardStack} />
        <Tab.Screen name="Calendar" component={CalendarStack} />
        <Tab.Screen name="Shifts" component={ShiftsStack} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <RotationsProvider>
            <RootNavigator />
          </RotationsProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
