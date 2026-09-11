import { Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';

export type ShareDestination = 'google' | 'apple' | 'ics';

type Props = {
  visible: boolean;
  onSelect: (destination: ShareDestination) => void;
  onCancel: () => void;
  /** Fired after the modal finish dismissing (needed on iOS before share / Linking). */
  onDismiss?: () => void;
};

type DestRow = {
  id: ShareDestination;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: 'calendar.shareDestGoogle' | 'calendar.shareDestApple' | 'calendar.shareDestIcs';
};

const DEST_ROWS: readonly DestRow[] = [
  {
    id: 'google',
    icon: 'logo-google',
    labelKey: 'calendar.shareDestGoogle',
  },
  {
    id: 'apple',
    icon: 'calendar-outline',
    labelKey: 'calendar.shareDestApple',
  },
  {
    id: 'ics',
    icon: 'document-outline',
    labelKey: 'calendar.shareDestIcs',
  },
];

/** Bottom sheet to choose Google / Apple Calendar / .ics file share. */
export function ShareDestinationModal({
  visible,
  onSelect,
  onCancel,
  onDismiss,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  // Apple Calendar (EventKit) is only useful on iOS; Android uses Google + ICS.
  const rows =
    Platform.OS === 'ios'
      ? DEST_ROWS
      : DEST_ROWS.filter((row) => row.id !== 'apple');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      onDismiss={onDismiss}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: colors.scrim }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.sharePickCancel')}
          onPress={onCancel}
          className="absolute inset-0"
        />
        <View
          className="w-full rounded-t-3xl px-4 pb-8 pt-4"
          style={{ backgroundColor: colors.bg }}
        >
          <Text
            className="mb-3 px-2 font-serif text-3xl"
            style={{ color: colors.text }}
          >
            {t('calendar.shareDestTitle')}
          </Text>
          <View className="gap-2 pb-2">
            {rows.map((row) => (
              <Pressable
                key={row.id}
                accessibilityRole="button"
                onPress={() => {
                  onSelect(row.id);
                }}
                className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:opacity-60"
                style={{ backgroundColor: colors.bg1 }}
              >
                <Ionicons name={row.icon} size={22} color={colors.brand} />
                <Text
                  className="flex-1 text-base font-medium"
                  style={{ color: colors.text }}
                >
                  {t(row.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            className="mt-2 items-center py-3 active:opacity-60"
          >
            <Text
              className="text-base font-medium opacity-60"
              style={{ color: colors.text }}
            >
              {t('calendar.sharePickCancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
