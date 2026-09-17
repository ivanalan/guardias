import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppLanguage } from '../../../i18n';
import { weekdayInitials } from '../../dashboard/format-home-copy';
import { SCREEN_GUTTER } from '../../../theme/layout';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import { GhostCalendarPreview } from './ghost-calendar-preview';
import { GhostShiftsPreview } from './ghost-shifts-preview';

const GHOST_OPACITY = 1;
type ShiftsEmptyStateProps = {
  onAddPress: () => void;
};

function EmptyStateCta({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
        {label}
      </Text>
    </Pressable>
  );
}

/** Full-screen first-run state — no tab bar or page chrome. */
export function ShiftsEmptyState({ onAddPress }: ShiftsEmptyStateProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const title = t('shifts.emptyTitle');
  const body = t('shifts.emptyBody');
  const cta = t('shifts.emptyCta');

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="flex-1 justify-center"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + SCREEN_GUTTER,
        paddingRight: insets.right + SCREEN_GUTTER,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${body}`}
    >
      <View className="gap-4">
        <CopyBlock title={title} body={body} />
        <View
          className="w-full gap-5"
          pointerEvents="none"
          style={{ opacity: GHOST_OPACITY }}
        >
          <GhostShiftsPreview caption={t('home.shiftsLeft')} />
          <GhostCalendarPreview weekdayLabels={weekdayInitials(language)} />
        </View>
        <EmptyStateCta label={cta} onPress={onAddPress} />
      </View>
    </Animated.View>
  );
}

function CopyBlock({ title, body }: { title: string; body: string }) {
  const { colors } = useTheme();

  return (
    <View className="gap-2">
      <Text
        className="font-serif text-6xl tracking-tight"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text className="font-mono text-base" style={{ color: colors.textMuted }}>
        {body}
      </Text>
    </View>
  );
}
