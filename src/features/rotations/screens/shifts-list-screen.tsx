import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { SectionList } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle, SCREEN_PAGE_TITLE_ICON_SIZE } from '../../../components/screen-page-title';
import { SCREEN_GUTTER, FLOATING_TAB_BAR_CLEARANCE } from '../../../theme/layout';
import type { AppLanguage } from '../../../i18n';
import { Pressable, Text, View } from '../../../tw';
import { RotationPeriodRow } from '../components/rotation-period-row';
import { ShiftsEmptyState } from '../components/shifts-empty-state';
import { formatPeriodRange } from '../format-period-range';
import {
  groupPeriodsByRecency,
  type PeriodRecencySection,
} from '../group-periods-by-recency';
import { useRotations } from '../rotations-context';
import type { ShiftsStackParamList } from '../shifts-stack';
import type { RotationPeriod } from '../types';

type Props = NativeStackScreenProps<ShiftsStackParamList, 'ShiftsList'>;

function keyExtractor(item: RotationPeriod) {
  return item.id;
}

/** Shifts tab list of rotation periods. */
export function ShiftsListScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods } = useRotations();
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const sections = groupPeriodsByRecency(periods, todayIso);

  if (periods.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <ShiftsEmptyState
          onAddPress={() => {
            navigation.navigate('AddRotation');
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScreenPageTitle
        title={t('tabs.shifts')}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('shifts.addA11y')}
            onPress={() => {
              navigation.navigate('AddRotation');
            }}
            className="px-2 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons name="add" size={SCREEN_PAGE_TITLE_ICON_SIZE} color="#1C1B1F" />
          </Pressable>
        }
      />
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 12,
          paddingHorizontal: SCREEN_GUTTER,
          paddingTop: 12,
          paddingBottom: FLOATING_TAB_BAR_CLEARANCE,
        }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({
          section,
        }: {
          section: PeriodRecencySection;
        }) => (
          <Text className="px-1 pt-2 font-mono text-sm text-neutral-500">
            {t(`shifts.${section.titleKey}`)}
          </Text>
        )}
        renderItem={({ item }) => (
          <RotationPeriodRow
            label={item.label}
            meta={t('shifts.rowMeta', {
              range: formatPeriodRange(
                item.startDate,
                item.endDate,
                language,
              ),
              letter: item.pattern.offset,
            })}
            color={item.color}
            onPress={() => {
              navigation.navigate('RotationDetail', { periodId: item.id });
            }}
          />
        )}
        accessibilityLabel={t('tabs.shifts')}
      />
    </View>
  );
}
