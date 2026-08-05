import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { HomeScreen } from './screens/home-screen';

export type DashboardStackParamList = {
  HomeHome: undefined;
};

type HomeHomeProps = NativeStackScreenProps<DashboardStackParamList, 'HomeHome'>;

const Stack = createNativeStackNavigator<DashboardStackParamList>();

function HomeHomeScreen({ navigation }: HomeHomeProps) {
  const parent = navigation.getParent();

  return (
    <HomeScreen
      onOpenCalendar={() => {
        parent?.navigate('Calendar');
      }}
      onOpenRotations={() => {
        parent?.navigate('Shifts');
      }}
    />
  );
}

/** Native stack for the Home tab (matches Calendar / Shifts header). */
export function DashboardStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeHome"
        component={HomeHomeScreen}
        options={{
          title: t('tabs.home'),
        }}
      />
    </Stack.Navigator>
  );
}
