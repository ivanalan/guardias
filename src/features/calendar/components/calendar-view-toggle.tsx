import { useTranslation } from 'react-i18next';

import { INK_COLOR } from '../../../theme/brand';
import { ANDROID_TEXT_WIDTH_BUMP } from '../../../theme/android-text';
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
            className="active:opacity-80"
            style={[
              {
                borderCurve: 'continuous',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 8,
              },
              selected
                ? { backgroundColor: INK_COLOR }
                : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              className={`text-sm font-mono ${selected ? 'text-white' : 'text-ink'}`}
              style={ANDROID_TEXT_WIDTH_BUMP}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
