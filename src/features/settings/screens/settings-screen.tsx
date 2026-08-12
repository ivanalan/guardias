import { useTranslation } from 'react-i18next';

import { BRAND_SELECTION } from '../../../theme/brand';
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
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-6 p-6"
    >
      <View className="gap-2">
        <Text className="text-sm font-medium text-neutral-600">
          {t('settings.language')}
        </Text>
        <View className="gap-2">
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
                className="rounded-xl border px-4 py-3 active:opacity-70"
                style={[
                  { borderCurve: 'continuous' },
                  selected
                    ? {
                        backgroundColor: BRAND_SELECTION.background,
                        borderColor: BRAND_SELECTION.border,
                      }
                    : { borderColor: '#e5e5e5', backgroundColor: '#ffffff' },
                ]}
              >
                <Text
                  className={`text-base ${selected ? 'font-semibold' : ''}`}
                  style={{
                    color: selected
                      ? BRAND_SELECTION.foreground
                      : '#262626',
                  }}
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
