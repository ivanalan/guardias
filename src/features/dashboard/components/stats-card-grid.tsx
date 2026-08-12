import type { ReactNode } from 'react';

import { View } from '../../../tw';

type StatsCardGridProps = {
  children: ReactNode;
};

/** Two-column wrap grid for home metric cards. */
export function StatsCardGrid({ children }: StatsCardGridProps) {
  return (
    <View className="w-full flex-row flex-wrap gap-3">{children}</View>
  );
}
