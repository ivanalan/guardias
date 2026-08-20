import './src/global.css';

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from './src/i18n';
import { CalendarStack } from './src/features/calendar/calendar-stack';
import { DashboardStack } from './src/features/dashboard/dashboard-stack';
import { RotationsProvider } from './src/features/rotations/rotations-context';
import { PreferencesProvider } from './src/features/settings/preferences-context';
import { ShiftsStack } from './src/features/rotations/shifts-stack';
import { FloatingTabBar } from './src/navigation/floating-tab-bar';
import type { TabParamList } from './src/navigation/types';

void SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator<TabParamList>();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={DashboardStack} />
        <Tab.Screen name="Calendar" component={CalendarStack} />
        <Tab.Screen name="Shifts" component={ShiftsStack} />
      </Tab.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError != null) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && fontError == null) {
    return null;
  }

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
