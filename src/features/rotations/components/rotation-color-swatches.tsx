import { useTranslation } from 'react-i18next';

import {
  TODAY_BORDER_WIDTH,
  TODAY_INNER_GAP,
} from '../../calendar/calendar-day-marker';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, View } from '../../../tw';
import { ROTATION_COLORS } from '../rotation-colors';

const SWATCH_SIZE = 32;
const SELECTED_SIZE = 36;
const SELECTED_RADIUS = SELECTED_SIZE / 2;
const SELECTED_INNER_RADIUS = Math.max(
  SELECTED_RADIUS - TODAY_INNER_GAP - TODAY_BORDER_WIDTH,
  4,
);

type Props = {
  value: string;
  onChange: (color: string) => void;
};

/** Preset color swatches for choosing a rotation calendar mark color. */
export function RotationColorSwatches({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between">
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
            style={
              selected
                ? {
                    width: SELECTED_SIZE,
                    height: SELECTED_SIZE,
                    borderRadius: SELECTED_RADIUS,
                    borderWidth: TODAY_BORDER_WIDTH,
                    borderColor: colors.brand,
                    padding: TODAY_INNER_GAP,
                    backgroundColor: colors.bg1,
                  }
                : {
                    width: SWATCH_SIZE,
                    height: SWATCH_SIZE,
                    borderRadius: SWATCH_SIZE / 2,
                    backgroundColor: color,
                  }
            }
            hitSlop={4}
          >
            {selected ? (
              <View
                className="flex-1 self-stretch"
                style={{
                  backgroundColor: color,
                  borderRadius: SELECTED_INNER_RADIUS,
                }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
