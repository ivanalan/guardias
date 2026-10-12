import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCREEN_GUTTER } from '../../../theme/layout';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';

type HomeIdleEmptyVariant = 'friendOnly' | 'noUpcoming';

type HomeIdleEmptyProps = {
  variant: HomeIdleEmptyVariant;
  onAddPress: () => void;
};

const COPY_KEYS = {
  friendOnly: {
    title: 'home.noPrimaryTitle',
    body: 'home.noPrimaryBody',
    cta: 'home.noPrimaryCta',
  },
  noUpcoming: {
    title: 'home.noUpcomingTitle',
    body: 'home.noUpcomingBody',
    cta: 'home.noUpcomingCta',
  },
} as const;

/**
 * Home when there is nothing to show on the dashboard — friend-only schedules,
 * or primaries with no upcoming shifts. Not first-run onboarding.
 */
export function HomeIdleEmpty({ variant, onAddPress }: HomeIdleEmptyProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keys = COPY_KEYS[variant];
  const title = t(keys.title);
  const body = t(keys.body);
  const cta = t(keys.cta);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddPress();
  };

  return (
    <View
      className="flex-1 items-center justify-center gap-8"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 16,
        paddingLeft: insets.left + SCREEN_GUTTER,
        paddingRight: insets.right + SCREEN_GUTTER,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${body}`}
    >
      <View className="w-full gap-2">
        <Text
          className="font-serif text-5xl tracking-tight"
          style={{ color: colors.text, textAlign: 'center' }}
        >
          {title}
        </Text>
        <Text
          className="font-mono text-base"
          style={{ color: colors.textMuted, textAlign: 'center' }}
        >
          {body}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cta}
        onPress={handlePress}
        className="w-full items-center px-6 py-4 active:opacity-80"
        style={{
          backgroundColor: colors.brand,
          borderCurve: 'continuous',
          borderRadius: 32,
        }}
      >
        <Text
          className="font-mono text-base font-semibold"
          style={{ color: colors.textInverse }}
        >
          {cta}
        </Text>
      </Pressable>
    </View>
  );
}
