import { Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';

export type ShareDestination =
  | 'link'
  | 'image'
  | 'device'
  | 'google'
  | 'ics';

type Props = {
  visible: boolean;
  /**
   * Combined sheet: export calendars on this phone, then send a shareable link.
   * Used from rotation detail and calendar share.
   */
  linkPrimary?: boolean;
  /** Serif sheet title — the rotation being shared / exported. */
  rotationLabel?: string;
  onSelect: (destination: ShareDestination) => void;
  onCancel: () => void;
  /** Fired after the modal finish dismissing (needed on iOS before share / Linking). */
  onDismiss?: () => void;
};

type DestRow = {
  id: Exclude<ShareDestination, 'link'>;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey:
    | 'calendar.shareDestDevice'
    | 'calendar.shareDestGoogle'
    | 'calendar.shareDestIcs'
    | 'shifts.detail.shareImage';
};

const PILL_RADIUS = 32;

function platformExportRows(includeIcs: boolean): DestRow[] {
  const rows: DestRow[] = [];

  // iOS: one EventKit "Add Event" path (user picks Apple / Google / etc.).
  // Android: Google TEMPLATE URL in an in-app browser.
  if (Platform.OS === 'ios') {
    rows.push({
      id: 'device',
      icon: 'calendar-outline',
      labelKey: 'calendar.shareDestDevice',
    });
  } else if (Platform.OS === 'android' || Platform.OS === 'web') {
    rows.push({
      id: 'google',
      icon: 'logo-google',
      labelKey: 'calendar.shareDestGoogle',
    });
  }

  if (includeIcs) {
    rows.push({
      id: 'ics',
      icon: 'document-outline',
      labelKey: 'calendar.shareDestIcs',
    });
  }

  rows.push({
    id: 'image',
    icon: 'image-outline',
    labelKey: 'shifts.detail.shareImage',
  });

  return rows;
}

/** Bottom sheet: share link and/or device / Google Calendar / .ics. */
export function ShareDestinationModal({
  visible,
  linkPrimary = false,
  rotationLabel,
  onSelect,
  onCancel,
  onDismiss,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const exportRows = platformExportRows(!linkPrimary);

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
          className="w-full rounded-t-3xl px-4 pb-8 pt-6"
          style={{ backgroundColor: colors.bg }}
        >
          {linkPrimary ? (
            <CombinedShareBody
              rotationLabel={rotationLabel}
              exportRows={exportRows}
              onSelect={onSelect}
              onCancel={onCancel}
            />
          ) : (
            <ExportOnlyBody
              exportRows={exportRows}
              onSelect={onSelect}
              onCancel={onCancel}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function CombinedShareBody({
  rotationLabel,
  exportRows,
  onSelect,
  onCancel,
}: {
  rotationLabel?: string;
  exportRows: DestRow[];
  onSelect: (destination: ShareDestination) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="gap-5 pb-2">
      {rotationLabel ? (
        <Text
          className="px-2 font-serif text-4xl"
          style={{ color: colors.text }}
        >
          {rotationLabel}
        </Text>
      ) : null}

      {exportRows.length > 0 ? (
        <View className="gap-4">
          <Text
            className="px-2 font-mono text-base"
            style={{ color: colors.text }}
          >
            {t('shifts.detail.shareExportTitle')}
          </Text>
          <View className="gap-2">
            {exportRows.map((row) => (
              <SecondaryPillButton
                key={row.id}
                icon={row.icon}
                label={t(row.labelKey)}
                onPress={() => {
                  onSelect(row.id);
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View className="mt-3 gap-4">
        <Text
          className="px-2 font-mono text-base"
          style={{ color: colors.text }}
        >
          {t('shifts.detail.shareLinkTitle')}
        </Text>
        <PrimaryPillButton
          icon="share-social-outline"
          label={t('shifts.detail.shareLink')}
          onPress={() => {
            onSelect('link');
          }}
        />
      </View>

      <CancelButton onPress={onCancel} />
    </View>
  );
}

function ExportOnlyBody({
  exportRows,
  onSelect,
  onCancel,
}: {
  exportRows: DestRow[];
  onSelect: (destination: ShareDestination) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      <Text
        className="mb-3 px-2 font-serif text-4xl"
        style={{ color: colors.text }}
      >
        {t('calendar.shareDestTitle')}
      </Text>
      <View className="gap-2 pb-2">
        {exportRows.map((row) => (
          <SecondaryPillButton
            key={row.id}
            icon={row.icon}
            label={t(row.labelKey)}
            onPress={() => {
              onSelect(row.id);
            }}
          />
        ))}
      </View>
      <CancelButton onPress={onCancel} />
    </>
  );
}

function PrimaryPillButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center justify-center gap-3 py-4 active:opacity-80"
      style={{
        backgroundColor: colors.brand,
        borderCurve: 'continuous',
        borderRadius: PILL_RADIUS,
        paddingHorizontal: 24,
      }}
    >
      <Ionicons name={icon} size={20} color={colors.textInverse} />
      <Text
        className="font-mono text-base font-semibold"
        style={{ color: colors.textInverse }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Outlined pill — same geometry as primary, border instead of fill. */
function SecondaryPillButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center justify-center gap-3 py-4 active:opacity-80"
      style={{
        backgroundColor: colors.bg,
        borderCurve: 'continuous',
        borderRadius: PILL_RADIUS,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 24,
      }}
    >
      <Ionicons name={icon} size={20} color={colors.brand} />
      <Text
        className="font-mono text-base font-semibold"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CancelButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="items-center py-3 active:opacity-60"
    >
      <Text
        className="text-base font-medium opacity-60"
        style={{ color: colors.text }}
      >
        {t('calendar.sharePickCancel')}
      </Text>
    </Pressable>
  );
}
