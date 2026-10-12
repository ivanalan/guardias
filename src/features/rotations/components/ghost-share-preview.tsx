import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius } from '../../../theme/widget-radius';
import { Text, View } from '../../../tw';

const PILL_RADIUS = 28;

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Sample share-sheet card for the empty-state info page. */
export function GhostSharePreview() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { borderRadius, onLayout } = useWidgetBorderRadius();

  return (
    <View
      className="w-full gap-3 px-gutter py-widget"
      onLayout={onLayout}
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius,
      }}
    >
      <Text
        className="font-serif text-2xl tracking-tight"
        style={{ color: colors.text }}
      >
        {t('shifts.emptyInfoShareTitle')}
      </Text>
      <View className="gap-2">
        <SharePill
          icon="image-outline"
          label={t('shifts.detail.shareImage')}
        />
        <SharePill
          icon="calendar-outline"
          label={t('calendar.shareDestDevice')}
        />
        <SharePill
          icon="share-social-outline"
          label={t('shifts.detail.shareLink')}
        />
      </View>
    </View>
  );
}

function SharePill({ icon, label }: { icon: IconName; label: string }) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center justify-center gap-2 py-3"
      style={{
        backgroundColor: colors.bg,
        borderCurve: 'continuous',
        borderRadius: PILL_RADIUS,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 20,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.brand} />
      <Text
        className="font-mono text-sm font-semibold"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
    </View>
  );
}
