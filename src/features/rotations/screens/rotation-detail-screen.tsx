import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Platform, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import {
  getPeriodShiftProgress,
  getPeriodShiftStatus,
  type DurationParts,
  type HomepageShiftStatus,
} from '../../../lib/shifts';
import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius } from '../../../theme/widget-radius';
import { Pressable, ScrollView, Text, View } from '../../../tw';
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
import { NextShiftCard } from '../../dashboard/components/next-shift-card';
import { ShiftsLeftCard } from '../../dashboard/components/shifts-left-card';
import { formatWeekdayLong } from '../../dashboard/format-home-copy';
import { RotationDetailCalendar } from '../components/rotation-detail-calendar';
import { formatFormDate, formatPeriodRange } from '../format-period-range';
import { isSecondary } from '../period-role';
import { resolveRotationColor } from '../rotation-colors';
import { useRotations } from '../rotations-context';
import { buildShareUrl } from '../share-rotation-link';
import type { ShiftsStackParamList } from '../shifts-stack';
import type { RotationPeriod } from '../types';

const REFRESH_MS = 60_000;

type Props = NativeStackScreenProps<ShiftsStackParamList, 'RotationDetail'>;

type TemporalKind = 'upcoming' | 'active' | 'past';

function temporalKind(period: RotationPeriod, todayIso: string): TemporalKind {
  if (todayIso < period.startDate) {
    return 'upcoming';
  }
  if (todayIso > period.endDate) {
    return 'past';
  }
  return 'active';
}

function FactCard({
  value,
  caption,
  className,
}: {
  value: string;
  caption: string;
  className?: string;
}) {
  const { colors } = useTheme();
  const { borderRadius, onLayout } = useWidgetBorderRadius();
  return (
    <View
      className={className ?? 'w-full gap-1 px-gutter py-widget'}
      onLayout={onLayout}
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius,
      }}
    >
      <Text
        className="font-serif text-3xl"
        style={{ color: colors.text }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text className="font-mono text-sm" style={{ color: colors.text }}>
        {caption}
      </Text>
    </View>
  );
}

function ActiveNextShiftCard({
  status,
  language,
  durationValue,
}: {
  status: Exclude<HomepageShiftStatus, { kind: 'idle' }>;
  language: AppLanguage;
  durationValue: (duration: DurationParts) => string;
}) {
  const { t } = useTranslation();

  if (status.kind === 'in_shift') {
    return (
      <NextShiftCard
        compact
        duration={durationValue(status.remainingInShift)}
        caption={t('home.stats.timeLeft')}
        weekday=""
      />
    );
  }

  return (
    <NextShiftCard
      compact
      duration={durationValue(status.untilStart)}
      caption={`${t('home.nextShift')}: `}
      weekday={formatWeekdayLong(status.nextShift.startDateTime, language)}
    />
  );
}

/** Read-only rotation period summary with edit and delete. */
export function RotationDetailScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods, deletePeriod } = useRotations();
  const period = periods.find((item) => item.id === route.params.periodId);
  const periodId = period?.id;
  const [now, setNow] = useState(() => new Date());
  const [shareVisible, setShareVisible] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [imageRequest, setImageRequest] =
    useState<RotationImageShareRequest | null>(null);
  const pendingShareRef = useRef<{
    period: RotationPeriod;
    destination: ShareDestination;
  } | null>(null);

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

  useLayoutEffect(() => {
    if (periodId == null || period == null) {
      navigation.setOptions({ headerRight: undefined });
      return;
    }

    navigation.setOptions({
      title: period.label,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('shifts.detail.shareA11y')}
            onPress={() => {
              if (sharing) {
                return;
              }
              setShareVisible(true);
            }}
            disabled={sharing}
            className="px-2 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons
              name="share-social-outline"
              size={24}
              color={colors.brand}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('shifts.detail.edit')}
            onPress={() => {
              navigation.navigate('EditRotation', { periodId });
            }}
            className="px-2 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons name="create-outline" size={24} color={colors.brand} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, period, periodId, t, colors.brand, sharing]);

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
          // iOS: only `url` — passing the same link in both `message` and `url`
          // makes the sheet show “2 links” (and WhatsApp posts it twice).
          // Android ignores `url` and needs `message`.
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
        return;
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
    if (period == null) {
      setShareVisible(false);
      return;
    }
    pendingShareRef.current = { period, destination };
    setShareVisible(false);
    if (Platform.OS !== 'ios') {
      setTimeout(() => {
        flushPendingShare();
      }, 300);
    }
  }

  if (period == null) {
    return (
      <View
        className="flex-1 items-center justify-center gap-2 p-gutter"
        style={{ backgroundColor: colors.bg }}
      >
        <Text className="text-base" style={{ color: colors.text }}>
          {t('shifts.detail.notFound')}
        </Text>
      </View>
    );
  }

  const patternTitleKey =
    period.pattern.cycleDays === 5
      ? 'shifts.form.patternAETitle'
      : period.pattern.cycleDays === 4
        ? 'shifts.form.patternADTitle'
        : 'shifts.form.patternACTitle';
  const patternSubtitleKey =
    period.pattern.cycleDays === 5
      ? 'shifts.form.patternAESubtitle'
      : period.pattern.cycleDays === 4
        ? 'shifts.form.patternADSubtitle'
        : 'shifts.form.patternACSubtitle';
  const patternTitle = t(patternTitleKey);
  const patternSubtitle = t(patternSubtitleKey);
  const subtitle = t('shifts.rowMeta', {
    range: formatPeriodRange(period.startDate, period.endDate, language),
    letter: period.pattern.offset,
  });
  const vacationValue =
    period.vacationStartDate != null && period.vacationEndDate != null
      ? formatPeriodRange(
          period.vacationStartDate,
          period.vacationEndDate,
          language,
        )
      : t('shifts.detail.noVacation');
  const color = resolveRotationColor(period.color, colors);
  const todayIso = format(now, 'yyyy-MM-dd');
  const phase = temporalKind(period, todayIso);
  const periodProgress = getPeriodShiftProgress(period, now);
  const remaining = Math.max(
    0,
    periodProgress.total - periodProgress.completed,
  );
  const status = getPeriodShiftStatus(period, now);

  const durationValue = (duration: DurationParts) =>
    t('home.durationLong', {
      days: duration.days,
      hours: duration.hours,
    });

  const deletePeriodId = period.id;
  const periodLabel = period.label;

  function confirmDelete() {
    Alert.alert(
      t('shifts.detail.deleteConfirmTitle'),
      t('shifts.detail.deleteConfirmBody', { label: periodLabel }),
      [
        { text: t('shifts.detail.deleteCancel'), style: 'cancel' },
        {
          text: t('shifts.detail.delete'),
          style: 'destructive',
          onPress: () => {
            deletePeriod(deletePeriodId);
            navigation.goBack();
          },
        },
      ],
    );
  }

  let statusCard = null;
  if (phase === 'upcoming') {
    statusCard = (
      <FactCard
        value={formatFormDate(period.startDate, language)}
        caption={t('shifts.detail.starts')}
      />
    );
  } else if (phase === 'past') {
    statusCard = (
      <FactCard
        value={formatFormDate(period.endDate, language)}
        caption={t('shifts.detail.ended')}
      />
    );
  } else if (status.kind !== 'idle') {
    statusCard = (
      <ActiveNextShiftCard
        status={status}
        language={language}
        durationValue={durationValue}
      />
    );
  }

  const deleteBottomInset = Math.max(insets.bottom, 8);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-10 p-gutter"
      >
        <View className="gap-3">
          <Text
            className="font-serif text-3xl"
            style={{ color: colors.text }}
            accessibilityRole="header"
          >
            {t('shifts.detail.detailsSection')}
          </Text>

          <View className="gap-5">
            <View className="w-full flex-row items-center gap-3">
              {isSecondary(period) ? (
                <Ionicons name="people" size={20} color={colors.text} />
              ) : null}
              <Text
                className="min-w-0 flex-1 font-mono text-base"
                style={{ color: colors.text }}
              >
                {subtitle}
              </Text>
            </View>

            <View className="w-full flex-row gap-4">
              <FactCard
                className="min-w-0 flex-1 gap-1 px-gutter py-widget"
                value={`${patternTitle} · ${period.pattern.offset}`}
                caption={patternSubtitle}
              />
              <FactCard
                className="min-w-0 flex-1 gap-1 px-gutter py-widget"
                value={`${period.shiftStartTime} · ${t('shifts.form.shiftLengthHours', { hours: period.shiftLengthHours })}`}
                caption={t('shifts.form.shiftStartTime')}
              />
            </View>

            <ShiftsLeftCard
              compact
              remaining={remaining}
              total={periodProgress.total}
              color={color}
              caption={t('home.shiftsLeft')}
            />

            {statusCard}

            <FactCard
              value={vacationValue}
              caption={t('shifts.detail.vacationLabel')}
            />
          </View>
        </View>

        <RotationDetailCalendar period={period} language={language} />

        <View style={{ height: deleteBottomInset + 56 }} />
      </ScrollView>

      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-0 items-center"
        style={{ paddingBottom: deleteBottomInset }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shifts.detail.delete')}
          onPress={confirmDelete}
          className="flex-row items-center justify-center gap-2 py-4 active:opacity-80"
          style={{
            backgroundColor: colors.brand,
            borderCurve: 'continuous',
            borderRadius: 32,
            paddingHorizontal: 32,
          }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textInverse} />
          <Text
            className="font-mono text-base font-semibold"
            style={{ color: colors.textInverse }}
          >
            {t('shifts.detail.delete')}
          </Text>
        </Pressable>
      </View>

      <ShareDestinationModal
        visible={shareVisible}
        linkPrimary
        rotationLabel={period.label}
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
    </View>
  );
}
