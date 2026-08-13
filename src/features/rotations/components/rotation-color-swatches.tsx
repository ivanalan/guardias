import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from '../../../tw';
import { ROTATION_COLORS } from '../rotation-colors';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

/** Preset color swatches for choosing a rotation calendar mark color. */
export function RotationColorSwatches({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {ROTATION_COLORS.map((color) => {
        const selected = color.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={color}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t('shifts.form.colorSwatchA11y', { color })}
            onPress={() => onChange(color)}
            className="items-center justify-center active:opacity-80"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: color,
              borderWidth: selected ? 3 : 0,
              borderColor: '#191C1A',
            }}
            hitSlop={4}
          >
            {selected ? (
              <Ionicons name="checkmark" size={18} color="#ffffff" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
