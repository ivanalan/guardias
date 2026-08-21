import { Ionicons } from '@expo/vector-icons';
import type { ParamListBase } from '@react-navigation/native';
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { SCREEN_PAGE_TITLE_ICON_SIZE } from '../components/screen-page-title';
import { CANVAS_COLOR, INK_COLOR } from '../theme/brand';
import { Pressable, Text } from '../tw';

/** Centered serif title for pushed stack screens (Form mock header). */
export function SecondaryHeaderTitle({ children }: { children: string }) {
  return (
    <Text className="font-serif text-3xl text-ink" numberOfLines={1}>
      {children}
    </Text>
  );
}

/** Android / non-iOS back control. iOS uses the native stack back button instead. */
function SecondaryHeaderBackButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      onPress={onPress}
      className="ml-2 active:opacity-60"
      hitSlop={8}
    >
      <Ionicons
        name="chevron-back"
        size={SCREEN_PAGE_TITLE_ICON_SIZE}
        color={INK_COLOR}
      />
    </Pressable>
  );
}

type SecondaryScreenOptionsArgs = {
  navigation: NativeStackNavigationProp<ParamListBase>;
};

/**
 * Native stack chrome: canvas bar, no hairline, back chevron + centered title.
 *
 * On iOS 26+, custom `headerLeft` React views are wrapped in a liquid-glass
 * UIBarButtonItem that stretches to ≥36pt and mis-centers the child. Use the
 * native minimal back button (SF Symbol) there; keep the Ionicons control elsewhere.
 */
export function secondaryScreenOptions({
  navigation,
}: SecondaryScreenOptionsArgs): NativeStackNavigationOptions {
  const useNativeBack = process.env.EXPO_OS === 'ios';

  return {
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerTintColor: INK_COLOR,
    headerStyle: { backgroundColor: CANVAS_COLOR },
    headerBackVisible: useNativeBack,
    ...(useNativeBack
      ? { headerBackButtonDisplayMode: 'minimal' as const }
      : {
          headerLeft: () => (
            <SecondaryHeaderBackButton onPress={() => navigation.goBack()} />
          ),
        }),
    headerTitle: ({ children }) => (
      <SecondaryHeaderTitle>{children}</SecondaryHeaderTitle>
    ),
  };
}
