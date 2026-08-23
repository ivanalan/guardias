import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import type { CalendarViewMode } from '../calendar-view-mode';

type Props = {
  value: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
};

const MODES: CalendarViewMode[] = ['month', 'scroll'];

/** Compact segmented control: single-month vs scrollable month list. */
export function CalendarViewToggle({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View accessibilityRole="tablist" className="flex-row items-center gap-3">
      {MODES.map((mode) => {
        const selected = value === mode;
        const label = t(`calendar.viewMode.${mode}`);
        return (
          <Pressable
            key={mode}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onChange(mode)}
            className="items-center justify-center active:opacity-80"
            style={[
              {
                borderCurve: 'continuous',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 8,
              },
              selected
                ? { backgroundColor: colors.brand }
                : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              className="text-center text-sm font-mono"
              style={{
                color: selected ? colors.textInverse : colors.text,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
