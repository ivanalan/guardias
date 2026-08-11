import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, View } from '../tw';

type ScreenPageTitleProps = {
  title: string;
  right?: ReactNode;
};

/** Large left-aligned page title for tab roots (replaces compact native header). */
export function ScreenPageTitle({ title, right }: ScreenPageTitleProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between gap-3 px-6 pb-2"
      style={{ paddingTop: insets.top + 16, paddingLeft: insets.left + 24 }}
    >
      <Text className="min-w-0 flex-1 text-4xl font-bold">{title}</Text>
      {right ? <View className="shrink-0">{right}</View> : null}
    </View>
  );
}
