import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ANDROID_TEXT_WIDTH_BUMP } from '../../../theme/android-text';
import type { ColorSchemePreference } from '../../../theme/theme-context';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { usePreferences } from '../preferences-context';
import type { AppPreferences } from '../types';

type LocaleOption = {
  value: AppPreferences['locale'];
  labelKey:
    | 'settings.languageSystem'
    | 'settings.languageEn'
    | 'settings.languageEs';
};

type AppearanceOption = {
  value: ColorSchemePreference;
  labelKey:
    | 'settings.appearanceSystem'
    | 'settings.appearanceLight'
    | 'settings.appearanceDark';
};

const LOCALE_OPTIONS: LocaleOption[] = [
  { value: null, labelKey: 'settings.languageSystem' },
  { value: 'en', labelKey: 'settings.languageEn' },
  { value: 'es', labelKey: 'settings.languageEs' },
];

const APPEARANCE_OPTIONS: AppearanceOption[] = [
  { value: null, labelKey: 'settings.appearanceSystem' },
  { value: 'light', labelKey: 'settings.appearanceLight' },
  { value: 'dark', labelKey: 'settings.appearanceDark' },
];

type PreferenceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function PreferenceChip({ label, selected, onPress }: PreferenceChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded-xl px-3.5 py-2.5 active:opacity-80"
      style={[
        { borderCurve: 'continuous' },
        selected
          ? { backgroundColor: colors.brand }
          : {
              backgroundColor: colors.bg1,
              borderWidth: 1,
              borderColor: colors.border,
            },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark" size={16} color={colors.textInverse} />
      ) : null}
      <Text
        className="font-mono text-sm"
        style={{
          ...ANDROID_TEXT_WIDTH_BUMP,
          color: selected ? colors.textInverse : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** F5 Settings: language + appearance preferences. */
export function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { locale, setLocale, colorScheme, setColorScheme } = usePreferences();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-6 p-gutter"
    >
      <View>
        <Text
          className="mb-1.5 font-mono text-sm"
          style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
        >
          {t('settings.language')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {LOCALE_OPTIONS.map((option) => {
            const label = t(option.labelKey);
            return (
              <PreferenceChip
                key={option.labelKey}
                label={label}
                selected={locale === option.value}
                onPress={() => setLocale(option.value)}
              />
            );
          })}
        </View>
      </View>

      <View>
        <Text
          className="mb-1.5 font-mono text-sm"
          style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
        >
          {t('settings.appearance')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {APPEARANCE_OPTIONS.map((option) => {
            const label = t(option.labelKey);
            return (
              <PreferenceChip
                key={option.labelKey}
                label={label}
                selected={colorScheme === option.value}
                onPress={() => setColorScheme(option.value)}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
