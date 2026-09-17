import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { FlatList } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import {
  ScreenPageTitle,
  SCREEN_PAGE_TITLE_ICON_SIZE,
} from '../../../components/screen-page-title';
import {
  SCREEN_GUTTER,
  FLOATING_TAB_BAR_CLEARANCE,
} from '../../../theme/layout';
import type { AppLanguage } from '../../../i18n';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, View } from '../../../tw';
import { PeriodRecencySectionHeader } from '../components/period-recency-section-header';
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

/** Space between the page title and the first section. */
const PAGE_TITLE_TO_CONTENT_GAP = 16;
/** Space between a section title and its rotation cards. */
const SECTION_TITLE_TO_CARDS_GAP = 12;
/** Space between rotation cards inside a section. */
const ROTATION_CARD_GAP = 16;
/** Space between section containers. */
const SECTION_CONTAINER_GAP = 32;

function sectionKeyExtractor(section: PeriodRecencySection) {
  return section.key;
}

function SectionContainerGap() {
  return <View style={{ height: SECTION_CONTAINER_GAP }} />;
}

type RecencySectionContainerProps = {
  section: PeriodRecencySection;
  colors: { text: string };
  pastExpanded: boolean;
  expandA11y: string;
  collapseA11y: string;
  rowMeta: (period: RotationPeriod) => string;
  onTogglePast: () => void;
  onPressPeriod: (period: RotationPeriod) => void;
  sectionTitle: string;
};

function RecencySectionContainer({
  section,
  colors,
  pastExpanded,
  expandA11y,
  collapseA11y,
  rowMeta,
  onTogglePast,
  onPressPeriod,
  sectionTitle,
}: RecencySectionContainerProps) {
  return (
    <View style={{ gap: SECTION_TITLE_TO_CARDS_GAP }}>
      <PeriodRecencySectionHeader
        sectionKey={section.key}
        title={sectionTitle}
        color={colors.text}
        pastExpanded={pastExpanded}
        expandA11y={expandA11y}
        collapseA11y={collapseA11y}
        onTogglePast={onTogglePast}
      />
      {section.data.length > 0 ? (
        <View style={{ gap: ROTATION_CARD_GAP }}>
          {section.data.map((item) => (
            <RotationPeriodRow
              key={item.id}
              label={item.label}
              meta={rowMeta(item)}
              color={item.color}
              showPeopleIcon={item.role === 'secondary'}
              onPress={() => {
                onPressPeriod(item);
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Shifts tab list of rotation periods. */
export function ShiftsListScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods } = useRotations();
  const [pastExpanded, setPastExpanded] = useState(false);
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const sections = groupPeriodsByRecency(periods, todayIso).map((section) => {
    if (section.key !== 'past' || pastExpanded) return section;
    return { ...section, data: [] };
  });

  if (periods.length === 0) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.bg }}>
        <ShiftsEmptyState
          onAddPress={() => {
            navigation.navigate('AddRotation');
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <FlatList
        data={sections}
        keyExtractor={sectionKeyExtractor}
        ListHeaderComponent={
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
                <Ionicons
                  name="add"
                  size={SCREEN_PAGE_TITLE_ICON_SIZE}
                  color={colors.brand}
                />
              </Pressable>
            }
          />
        }
        ListHeaderComponentStyle={{
          marginHorizontal: -SCREEN_GUTTER,
          marginBottom: PAGE_TITLE_TO_CONTENT_GAP,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: SCREEN_GUTTER,
          paddingBottom: FLOATING_TAB_BAR_CLEARANCE,
        }}
        ItemSeparatorComponent={SectionContainerGap}
        renderItem={({ item: section }) => (
          <RecencySectionContainer
            section={section}
            colors={colors}
            pastExpanded={pastExpanded}
            expandA11y={t('shifts.sectionPastExpandA11y')}
            collapseA11y={t('shifts.sectionPastCollapseA11y')}
            sectionTitle={t(`shifts.${section.titleKey}`)}
            rowMeta={(period) =>
              t('shifts.rowMeta', {
                range: formatPeriodRange(
                  period.startDate,
                  period.endDate,
                  language,
                ),
                letter: period.pattern.offset,
              })
            }
            onTogglePast={() => setPastExpanded((prev) => !prev)}
            onPressPeriod={(period) => {
              navigation.navigate('RotationDetail', {
                periodId: period.id,
                label: period.label,
              });
            }}
          />
        )}
        accessibilityLabel={t('tabs.shifts')}
      />
    </View>
  );
}
