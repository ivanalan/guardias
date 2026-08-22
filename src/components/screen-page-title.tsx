import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, View } from '../tw';
import { SCREEN_GUTTER } from '../theme/layout';

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

  return (
    <View
      className="px-gutter pb-2"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left + SCREEN_GUTTER,
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="min-w-0 flex-1 font-serif text-[48px] leading-none text-ink">
          {title}
        </Text>
        {right ? <View className="shrink-0">{right}</View> : null}
      </View>
      {subtitle ? (
        <Text className="mt-1 font-mono text-base text-ink">{subtitle}</Text>
      ) : null}
    </View>
  );
}
