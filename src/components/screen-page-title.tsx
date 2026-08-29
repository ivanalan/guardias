import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCREEN_GUTTER } from '../theme/layout';
import { useTheme } from '../theme/theme-context';
import { Text, View } from '../tw';

/** Icon size for header actions aligned to the page title. */
export const SCREEN_PAGE_TITLE_ICON_SIZE = 24;

type ScreenPageTitleProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

/** Large left-aligned page title for tab roots (replaces compact native header). */
export function ScreenPageTitle({
  title,
  subtitle,
  right,
}: ScreenPageTitleProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      className="px-gutter pb-2"
      style={{
        paddingTop: 80,
        paddingLeft: insets.left + SCREEN_GUTTER,
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="min-w-0 flex-1 font-serif text-[48px] leading-none"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
        {right ? <View className="shrink-0">{right}</View> : null}
      </View>
      {subtitle ? (
        <Text
          className="mt-1 font-mono text-base"
          style={{ color: colors.text }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
