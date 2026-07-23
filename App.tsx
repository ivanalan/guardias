import './src/global.css';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { I18nextProvider, useTranslation } from 'react-i18next';
import type { ComponentProps } from 'react';

import i18n from './src/i18n';
import { Text, View } from './src/tw';

type TabKey = 'Home' | 'Calendar' | 'Shifts';
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const Tab = createBottomTabNavigator();

const tabIcons: Record<TabKey, { focused: IconName; unfocused: IconName }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Calendar: { focused: 'calendar', unfocused: 'calendar-outline' },
  Shifts: { focused: 'clipboard-list', unfocused: 'clipboard-list-outline' },
};

/** Route name (stable id) → catalog key for the tab label */
const tabTitleKeys: Record<TabKey, 'tabs.home' | 'tabs.calendar' | 'tabs.shifts'> = {
  Home: 'tabs.home',
  Calendar: 'tabs.calendar',
  Shifts: 'tabs.shifts',
};

function TabPlaceholder({ titleKey }: { titleKey: (typeof tabTitleKeys)[TabKey] }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-2 p-6">
      <Text className="text-2xl font-semibold">{t(titleKey)}</Text>
      <Text className="text-center text-sm opacity-70">{t('home.placeholder')}</Text>
    </View>
  );
}

function HomeScreen() {
  return <TabPlaceholder titleKey="tabs.home" />;
}

function CalendarScreen() {
  return <TabPlaceholder titleKey="tabs.calendar" />;
}

function ShiftsScreen() {
  return <TabPlaceholder titleKey="tabs.shifts" />;
}

function RootNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#D1B20',
          tabBarInactiveTintColor: '#49454F',
          tabBarLabel: t(tabTitleKeys[route.name as TabKey]),
          tabBarIcon: ({ focused, color, size }) => {
            const icons = tabIcons[route.name as TabKey];
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
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Shifts" component={ShiftsScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
