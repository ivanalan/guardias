import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import {
  buildShift,
  findPeriodForDate,
  getDayInfo,
  isShiftDay,
  toggleDayShift,
} from '../../../lib/shifts';
import { BORDER_RADIUS } from '../../../theme/layout';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import { StatsCard } from '../../dashboard/components/stats-card';
import { StatsCardGrid } from '../../dashboard/components/stats-card-grid';
import {
  primaryPeriods,
  secondaryPeriods,
} from '../../rotations/period-role';
import { useRotations } from '../../rotations/rotations-context';
import { resolveRotationColor } from '../../rotations/rotation-colors';
import type { CalendarStackParamList } from '../calendar-stack';
import {
  formatDaySheetDate,
  formatShiftShortDate,
  formatShiftTime,
} from '../format-shift-datetime';

type Props = NativeStackScreenProps<CalendarStackParamList, 'DayDetail'>;

function DayActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="w-full items-center px-6 py-4 active:opacity-80"
      style={{
        backgroundColor: colors.brand,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <Text
        className="font-mono text-base font-semibold"
        style={{ color: colors.textInverse }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Read-only friend context when a secondary period works this day. */
function FriendShiftRow({
  name,
  meta,
  dotColor,
}: {
  name: string;
  meta: string;
  dotColor: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center gap-3 px-4 py-3"
      style={{
        borderCurve: 'continuous',
        borderRadius: BORDER_RADIUS,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg1,
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: dotColor,
        }}
      />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className="font-mono text-base"
          numberOfLines={1}
          style={{ color: colors.text }}
        >
          {name}
        </Text>
        <Text
          className="font-mono text-sm opacity-50"
          numberOfLines={1}
          style={{ color: colors.text }}
        >
          {meta}
        </Text>
      </View>
    </View>
  );
}

/** Form sheet: free day or shift summary for the tapped calendar date. */
export function DayDetailScreen({ route }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { periods, updatePeriod } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { date } = route.params;
  const dateLabel = formatDaySheetDate(date, language);
  const dayInfo = getDayInfo(periods, date);
  const period = findPeriodForDate(primaryPeriods(periods), date);
  const canToggle = period != null;
  const working = period != null && isShiftDay(period, date);

  const friendsOnDay = secondaryPeriods(periods).filter((item) =>
    isShiftDay(item, date),
  );
  const friendRows =
    friendsOnDay.length > 0 ? (
      <View className="gap-3">
        {friendsOnDay.map((friend) => {
          const friendShift = buildShift(friend, date);
          if (friendShift == null) {
            return null;
          }
          return (
            <FriendShiftRow
              key={friend.id}
              name={friend.label}
              meta={t('calendar.friendShiftMeta', {
                time: formatShiftTime(friendShift.startDateTime),
              })}
              dotColor={resolveRotationColor(friend.color, colors)}
            />
          );
        })}
      </View>
    ) : null;

  const handleToggle = () => {
    const next = toggleDayShift(periods, date);
    if (next != null) {
      updatePeriod(next);
    }
  };

  const actionButton = canToggle ? (
    <DayActionButton
      label={working ? t('calendar.skipShift') : t('calendar.coverDay')}
      onPress={handleToggle}
    />
  ) : null;

  if (dayInfo.kind === 'free') {
    return (
      <View className="gap-5 p-gutter" style={{ backgroundColor: colors.bg }}>
        <View className="gap-1">
          <Text
            className="font-serif text-4xl tracking-tight"
            style={{ color: colors.text }}
          >
            {dateLabel}
          </Text>
          <Text className="font-mono text-lg" style={{ color: colors.text }}>
            {t('calendar.freeDay')}
          </Text>
        </View>
        {friendRows}
        {actionButton}
      </View>
    );
  }

  if (dayInfo.kind === 'vacation') {
    return (
      <View className="gap-5 p-gutter" style={{ backgroundColor: colors.bg }}>
        <View className="gap-1">
          <Text
            className="font-serif text-4xl tracking-tight"
            style={{ color: colors.text }}
          >
            {dateLabel}
          </Text>
          <Text className="font-mono text-lg" style={{ color: colors.text }}>
            {t('calendar.vacationDay')}
          </Text>
          <Text
            className="font-mono text-base opacity-50"
            style={{ color: colors.text }}
          >
            {dayInfo.rotationLabel}
          </Text>
        </View>
        {friendRows}
        {actionButton}
      </View>
    );
  }

  const { shift } = dayInfo;

  return (
    <View className="gap-5 p-gutter" style={{ backgroundColor: colors.bg }}>
      <View className="gap-1">
        <Text
          className="font-serif text-4xl tracking-tight"
          style={{ color: colors.text }}
        >
          {dateLabel}
        </Text>
        <Text className="font-mono text-lg" style={{ color: colors.text }}>
          {shift.rotationLabel}
        </Text>
      </View>
      <StatsCardGrid>
        <StatsCard
          icon="log-in-outline"
          value={formatShiftTime(shift.startDateTime)}
          subtitle={t('calendar.startsOn', {
            date: formatShiftShortDate(shift.startDateTime, language),
          })}
        />
        <StatsCard
          icon="log-out-outline"
          value={formatShiftTime(shift.endDateTime)}
          subtitle={t('calendar.endsOn', {
            date: formatShiftShortDate(shift.endDateTime, language),
          })}
        />
      </StatsCardGrid>
      {friendRows}
      {actionButton}
    </View>
  );
}
