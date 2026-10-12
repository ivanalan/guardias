import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Share, type View as RNView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { format, differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

import {
  ScreenPageTitle,
  SCREEN_PAGE_TITLE_ICON_SIZE,
} from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import {
  getHomepageShiftStatus,
  getNextFreeWeekend,
  getPeriodDayProgress,
  getPeriodShiftProgress,
  getTimeUntilNextShift,
  listUpcomingShifts,
  type DurationParts,
  type HomepageShiftStatus,
  type PeriodDayProgress,
  type PeriodShiftProgress,
} from '../../../lib/shifts';
import type { TabParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, ScrollView, View } from '../../../tw';
import { buildShiftExportEvent } from '../../calendar/build-shift-export-event';
import {
  RotationImageCaptureHost,
  type RotationImageShareRequest,
} from '../../calendar/components/rotation-image-capture-host';
import {
  ShareDestinationModal,
  type ShareDestination,
} from '../../calendar/components/share-destination-modal';
import { openDeviceCalendar } from '../../calendar/open-device-calendar';
import { openGoogleCalendar } from '../../calendar/open-google-calendar';
import { getRangeMarkInputs } from '../../calendar/month-legend-stats';
import { ShiftsEmptyState } from '../../rotations/components/shifts-empty-state';
import { primaryPeriods } from '../../rotations/period-role';
import {
  resolveRotationColor,
  resolveShiftMarks,
} from '../../rotations/rotation-colors';
import { useRotations } from '../../rotations/rotations-context';
import { buildShareUrl } from '../../rotations/share-rotation-link';
import type { RotationPeriod } from '../../rotations/types';
import { HomeIdleEmpty } from '../components/home-idle-empty';
import { NextShiftCard } from '../components/next-shift-card';
import { ShareCoachMark } from '../components/share-coach-mark';
import { ShiftsLeftCard } from '../components/shifts-left-card';
import { TwoWeekCalendar } from '../components/two-week-calendar';
import { WeekendBanner } from '../components/weekend-banner';
import type { DashboardStackParamList } from '../dashboard-stack';
import {
  formatWeekendRange,
  formatWeekdayLong,
  weekdayInitials,
} from '../format-home-copy';
import {
  hasSeenHomeShareCoach,
  markHomeShareCoachSeen,
} from '../home-share-tour';
import { getTwoWeekDates } from '../two-week-dates';

const REFRESH_MS = 60_000;
const UPCOMING_SHIFTS_LIMIT = 4;
/** Let Home layout settle after save → tab navigation before measuring. */
const SHARE_COACH_START_DELAY_MS = 450;

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'HomeHome'>,
  BottomTabScreenProps<TabParamList>
>;

type ActiveHomeProps = {
  status: Exclude<HomepageShiftStatus, { kind: 'idle' }>;
  periods: readonly RotationPeriod[];
  now: Date;
  periodProgress: PeriodShiftProgress;
  dayProgress: PeriodDayProgress;
  language: AppLanguage;
};

function ActiveHomeContent({
  status,
  periods,
  now,
  periodProgress,
  dayProgress,
  language,
}: ActiveHomeProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const untilNext = getTimeUntilNextShift(status, now);
  const freeWeekend = getNextFreeWeekend(status.period, now);
  const todayIso = format(now, 'yyyy-MM-dd');
  const windowDates = getTwoWeekDates(now);
  const windowStart = windowDates[0]!;
  const windowEnd = windowDates[13]!;
  const markInputs = getRangeMarkInputs(periods, windowStart, windowEnd);
  const resolvedShiftMarks = useMemo(
    () => resolveShiftMarks(markInputs.shiftMarks, colors),
    [markInputs.shiftMarks, colors],
  );
  const resolvedSecondaryShiftMarks = useMemo(
    () => resolveShiftMarks(markInputs.secondaryShiftMarks, colors),
    [markInputs.secondaryShiftMarks, colors],
  );
  const shiftColorByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const { date, color } of resolvedShiftMarks) {
      map.set(date, color);
    }
    return map;
  }, [resolvedShiftMarks]);
  const secondaryDotsByDate = useMemo(() => {
    const map = new Map<
      string,
      { periodId: string; color: string }[]
    >();
    for (const mark of resolvedSecondaryShiftMarks) {
      if (mark.periodId == null) {
        continue;
      }
      const list = map.get(mark.date);
      const entry = { periodId: mark.periodId, color: mark.color };
      if (list != null) {
        list.push(entry);
      } else {
        map.set(mark.date, [entry]);
      }
    }
    return map;
  }, [resolvedSecondaryShiftMarks]);
  const freeWeekendDates = new Set(markInputs.freeWeekendDates);
  const vacationDates = new Set(markInputs.vacationDates);
  const remaining = Math.max(
    0,
    periodProgress.total - periodProgress.completed,
  );
  const daysRemaining = Math.max(0, dayProgress.total - dayProgress.completed);
  const color = resolveRotationColor(status.period.color, colors);
  const upcomingItems = listUpcomingShifts(
    status.period,
    now,
    UPCOMING_SHIFTS_LIMIT,
  ).map((shift) => {
    const daysUntil = differenceInCalendarDays(shift.startDateTime, now);
    return {
      dayNumber: format(shift.startDateTime, 'd'),
      weekday: formatWeekdayLong(shift.startDateTime, language),
      relativeLabel:
        daysUntil <= 0
          ? t('home.inDaysToday')
          : t('home.inDays', { count: daysUntil }),
    };
  });

  const durationValue = (duration: DurationParts) =>
    t('home.durationLong', {
      days: duration.days,
      hours: duration.hours,
    });

  const nextShiftCard =
    status.kind === 'in_shift' ? (
      <NextShiftCard
        duration={durationValue(status.remainingInShift)}
        caption={t('home.stats.timeLeft')}
        weekday=""
      />
    ) : untilNext != null && status.kind === 'between_shifts' ? (
      <NextShiftCard
        duration={durationValue(untilNext)}
        caption={`${t('home.nextShift')}: `}
        weekday={formatWeekdayLong(status.nextShift.startDateTime, language)}
      />
    ) : null;

  return (
    <View className="w-full gap-5">
      {freeWeekend != null ? (
        <WeekendBanner
          rangeLabel={formatWeekendRange(freeWeekend.saturdayIso, language)}
          caption={
            freeWeekend.isNow
              ? t('home.stats.now')
              : t('home.stats.nextFreeWeekend')
          }
        />
      ) : null}

      <TwoWeekCalendar
        dates={windowDates}
        weekdayLabels={weekdayInitials(language)}
        todayIso={todayIso}
        shiftColorByDate={shiftColorByDate}
        secondaryDotsByDate={secondaryDotsByDate}
        freeWeekendDates={freeWeekendDates}
        vacationDates={vacationDates}
        upcomingCaption={t('home.upcomingShifts')}
        upcomingEmptyCaption={t('home.stats.noneInPeriod')}
        upcomingItems={upcomingItems}
        upcomingAccentColor={color}
      />

      <ShiftsLeftCard
        remaining={remaining}
        total={periodProgress.total}
        color={color}
        caption={t('home.shiftsLeft')}
        daysRemaining={daysRemaining}
        daysTotal={dayProgress.total}
        daysCaption={t('home.daysLeft')}
      />

      {nextShiftCard}
    </View>
  );
}

/** F3 homepage: date header + weekend, two-week, remaining, next-shift widgets. */
export function HomeScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods } = useRotations();
  const shareTargetRef = useRef<RNView>(null);
  const [now, setNow] = useState(() => new Date());
  const [shareVisible, setShareVisible] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareCoachVisible, setShareCoachVisible] = useState(false);
  const [imageRequest, setImageRequest] =
    useState<RotationImageShareRequest | null>(null);
  const pendingShareRef = useRef<{
    period: RotationPeriod;
    destination: ShareDestination;
  } | null>(null);

  const status = getHomepageShiftStatus(periods, now);
  const primaryCount = primaryPeriods(periods).length;

  function dismissShareCoach() {
    setShareCoachVisible(false);
    void markHomeShareCoachSeen();
  }

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
      const id = setInterval(() => {
        setNow(new Date());
      }, REFRESH_MS);
      return () => {
        clearInterval(id);
      };
    }, []),
  );

  // First primary on Home: one-time spotlight on the share control.
  useFocusEffect(
    useCallback(() => {
      if (status.kind === 'idle' || primaryCount !== 1 || shareCoachVisible) {
        return;
      }

      let cancelled = false;
      const timer = setTimeout(() => {
        void (async () => {
          if (cancelled || (await hasSeenHomeShareCoach())) {
            return;
          }
          setShareCoachVisible(true);
        })();
      }, SHARE_COACH_START_DELAY_MS);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }, [status.kind, primaryCount, shareCoachVisible]),
  );

  async function runShareAction(
    sharePeriod: RotationPeriod,
    destination: ShareDestination,
  ) {
    setSharing(true);
    try {
      if (destination === 'image') {
        setImageRequest({ period: sharePeriod });
        return;
      }

      if (destination === 'link') {
        const url = buildShareUrl(sharePeriod);
        try {
          await Share.share(Platform.OS === 'ios' ? { url } : { message: url });
        } catch {
          Alert.alert(
            t('shifts.detail.shareFailedTitle'),
            t('shifts.detail.shareFailedBody'),
          );
        }
        return;
      }

      if (destination === 'google') {
        const event = buildShiftExportEvent(sharePeriod);
        const details =
          event != null && event.exDates.length > 0
            ? t('calendar.shareGoogleVacationNote', {
                dates: event.exDates.join(', '),
              })
            : undefined;
        const result = await openGoogleCalendar(sharePeriod, { details });
        if (!result.ok) {
          if (result.reason === 'empty') {
            Alert.alert(
              t('calendar.shareEmptyTitle'),
              t('calendar.shareEmptyBody'),
            );
          } else {
            Alert.alert(t('calendar.shareGoogleFailed'));
          }
        }
        return;
      }

      if (destination === 'device') {
        const event = buildShiftExportEvent(sharePeriod);
        const notes =
          event != null && event.exDates.length > 0
            ? t('calendar.shareDeviceVacationNote', {
                dates: event.exDates.join(', '),
              })
            : undefined;
        const result = await openDeviceCalendar(sharePeriod, { notes });
        if (!result.ok) {
          if (result.reason === 'empty') {
            Alert.alert(
              t('calendar.shareEmptyTitle'),
              t('calendar.shareEmptyBody'),
            );
          } else {
            Alert.alert(t('calendar.shareDeviceFailed'));
          }
        }
      }
    } finally {
      if (destination !== 'image') {
        setSharing(false);
      }
    }
  }

  function onImageShareComplete(
    result: 'saved' | 'shared' | 'empty' | 'unavailable' | 'failed',
  ) {
    setImageRequest(null);
    setSharing(false);
    if (result === 'saved') {
      Alert.alert(
        t('calendar.shareImageSavedTitle'),
        t('calendar.shareImageSavedBody'),
      );
      return;
    }
    if (result === 'empty') {
      Alert.alert(t('calendar.shareEmptyTitle'), t('calendar.shareEmptyBody'));
      return;
    }
    if (result === 'unavailable') {
      Alert.alert(t('calendar.shareUnavailable'));
      return;
    }
    if (result === 'failed') {
      Alert.alert(
        t('calendar.shareImageFailedTitle'),
        t('calendar.shareImageFailedBody'),
      );
    }
  }

  function flushPendingShare() {
    const pending = pendingShareRef.current;
    if (pending == null) {
      return;
    }
    pendingShareRef.current = null;
    void runShareAction(pending.period, pending.destination);
  }

  function queueShareAfterDest(destination: ShareDestination) {
    if (status.kind === 'idle') {
      setShareVisible(false);
      return;
    }
    pendingShareRef.current = { period: status.period, destination };
    setShareVisible(false);
    if (Platform.OS !== 'ios') {
      setTimeout(() => {
        flushPendingShare();
      }, 300);
    }
  }

  if (status.kind === 'idle') {
    const openAddRotation = () => {
      // Keep ShiftsList under the form so the native stack back control shows.
      navigation.navigate('Shifts', {
        state: {
          index: 1,
          routes: [{ name: 'ShiftsList' }, { name: 'AddRotation' }],
        },
      });
    };

    // Existing periods but nothing for Home — not first-run onboarding.
    if (periods.length > 0) {
      return (
        <View className="flex-1" style={{ backgroundColor: colors.bg }}>
          <HomeIdleEmpty
            variant={primaryCount === 0 ? 'friendOnly' : 'noUpcoming'}
            onAddPress={openAddRotation}
          />
        </View>
      );
    }

    return (
      <View className="flex-1" style={{ backgroundColor: colors.bg }}>
        <ShiftsEmptyState onAddPress={openAddRotation} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-5 px-gutter pb-tab-clearance"
      >
        <View className="-mx-gutter">
          <ScreenPageTitle
            title={status.period.label}
            right={
              <View className="flex-row items-center">
                <View ref={shareTargetRef} collapsable={false}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('shifts.detail.shareA11y')}
                    onPress={() => {
                      if (sharing) {
                        return;
                      }
                      if (shareCoachVisible) {
                        dismissShareCoach();
                      }
                      setShareVisible(true);
                    }}
                    disabled={sharing}
                    className="px-2 active:opacity-60"
                    hitSlop={8}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={SCREEN_PAGE_TITLE_ICON_SIZE}
                      color={colors.brand}
                    />
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('settings.openA11y')}
                  onPress={() => {
                    navigation.navigate('Settings');
                  }}
                  className="px-2 active:opacity-60"
                  hitSlop={8}
                >
                  <Ionicons
                    name="settings-outline"
                    size={SCREEN_PAGE_TITLE_ICON_SIZE}
                    color={colors.brand}
                  />
                </Pressable>
              </View>
            }
          />
        </View>
        <ActiveHomeContent
          status={status}
          periods={periods}
          now={now}
          periodProgress={getPeriodShiftProgress(status.period, now)}
          dayProgress={getPeriodDayProgress(
            status.period,
            format(now, 'yyyy-MM-dd'),
          )}
          language={language}
        />
      </ScrollView>
      <ShareDestinationModal
        visible={shareVisible}
        linkPrimary
        rotationLabel={status.period.label}
        onSelect={queueShareAfterDest}
        onCancel={() => {
          pendingShareRef.current = null;
          setShareVisible(false);
        }}
        onDismiss={flushPendingShare}
      />
      <RotationImageCaptureHost
        request={imageRequest}
        language={language}
        onComplete={onImageShareComplete}
      />
      <ShareCoachMark
        visible={shareCoachVisible}
        targetRef={shareTargetRef}
        onDismiss={dismissShareCoach}
        onTargetPress={() => {
          dismissShareCoach();
          if (!sharing) {
            setShareVisible(true);
          }
        }}
      />
    </View>
  );
}
