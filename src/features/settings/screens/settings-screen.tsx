import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ANDROID_TEXT_WIDTH_BUMP } from '../../../theme/android-text';
import { INK_COLOR } from '../../../theme/brand';
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

const LOCALE_OPTIONS: LocaleOption[] = [
  { value: null, labelKey: 'settings.languageSystem' },
  { value: 'en', labelKey: 'settings.languageEn' },
  { value: 'es', labelKey: 'settings.languageEs' },
];

/** F5 Settings: language preference (System / English / Español). */
export function SettingsScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = usePreferences();

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-6 p-gutter"
    >
      <View>
        <Text
          className="mb-1.5 font-mono text-sm text-ink"
          style={ANDROID_TEXT_WIDTH_BUMP}
        >
          {t('settings.language')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {LOCALE_OPTIONS.map((option) => {
            const selected = locale === option.value;
            const label = t(option.labelKey);
            return (
              <Pressable
                key={option.labelKey}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={label}
                onPress={() => setLocale(option.value)}
                className="flex-row items-center gap-1.5 rounded-xl px-3.5 py-2.5 active:opacity-80"
                style={[
                  { borderCurve: 'continuous' },
                  selected
                    ? { backgroundColor: INK_COLOR }
                    : {
                        backgroundColor: '#ffffff',
                        borderWidth: 1,
                        borderColor: '#e5e5e5',
                      },
                ]}
              >
                {selected ? (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                ) : null}
                <Text
                  className={`font-mono text-sm ${selected ? 'text-white' : 'text-neutral-500'}`}
                  style={ANDROID_TEXT_WIDTH_BUMP}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
