import { Ionicons } from '@expo/vector-icons';
import type { ParamListBase } from '@react-navigation/native';
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

import { SCREEN_PAGE_TITLE_ICON_SIZE } from '../components/screen-page-title';
import type { ThemeColors } from '../theme/colors';
import { useTheme } from '../theme/theme-context';
import { Pressable, Text } from '../tw';

/** Space reserved per side for back / save (icons + padding). */
const ANDROID_HEADER_ACTION_RESERVE = 56;

/**
 * Centered serif title for pushed stack screens (Form mock header).
 *
 * On Android, native-stack + custom headerLeft/Right + headerTitleAlign
 * center often gives the title a too-narrow Yoga box, so text truncates
 * while empty space remains. Force a width based on the window size.
 */
export function SecondaryHeaderTitle({ children }: { children: string }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isAndroid = process.env.EXPO_OS === 'android';
  const titleWidth = Math.max(0, width - ANDROID_HEADER_ACTION_RESERVE * 2);

  return (
    <Text
      className="font-serif text-3xl"
      numberOfLines={1}
      style={{
        color: colors.text,
        ...(isAndroid ? { width: titleWidth, textAlign: 'center' } : undefined),
      }}
    >
      {children}
    </Text>
  );
}

/** Android / non-iOS back control. iOS uses the native stack back button instead. */
function SecondaryHeaderBackButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

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
        color={colors.brand}
      />
    </Pressable>
  );
}

type SecondaryScreenOptionsArgs = {
  navigation: NativeStackNavigationProp<ParamListBase>;
  colors: ThemeColors;
};

/**
 * Native stack chrome: canvas bar, no hairline, back chevron + centered title.
 *
 * On iOS 26+, custom `headerLeft` React views are wrapped in a liquid-glass
 * UIBarButtonItem that stretches to ≥36pt and mis-centers the child. Use the
 * native minimal back button (SF Symbol) there; keep the Ionicons control elsewhere.
 */
export function getSecondaryScreenOptions({
  navigation,
  colors,
}: SecondaryScreenOptionsArgs): NativeStackNavigationOptions {
  const useNativeBack = process.env.EXPO_OS === 'ios';

  return {
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerTintColor: colors.brand,
    headerStyle: { backgroundColor: colors.bg },
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
