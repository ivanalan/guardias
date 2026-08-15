import { useTranslation } from 'react-i18next';

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
    <View
      accessibilityRole="tablist"
      className="h-9 flex-row rounded-[9px] bg-neutral-200/90 p-0.5"
      style={{ width: 200, borderCurve: 'continuous' }}
    >
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
            className={`min-w-0 flex-1 items-center justify-center rounded-lg active:opacity-80 ${
              selected ? 'bg-white' : ''
            }`}
            style={[
              { borderCurve: 'continuous' },
              selected
                ? {
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
                  }
                : undefined,
            ]}
          >
            <Text
              className={`text-sm ${
                selected ? 'font-semibold text-neutral-900' : 'text-neutral-900'
              }`}
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
