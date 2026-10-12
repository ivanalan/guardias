import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as RNScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppLanguage } from '../../../i18n';
import { weekdayInitials } from '../../dashboard/format-home-copy';
import { SCREEN_GUTTER } from '../../../theme/layout';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { GhostCalendarPreview } from './ghost-calendar-preview';
import { GhostSharePreview } from './ghost-share-preview';
import { GhostShiftsPreview } from './ghost-shifts-preview';
import { GhostWeekendPreview } from './ghost-weekend-preview';
import { GhostWidgetPreview } from './ghost-widget-preview';

const GHOST_OPACITY = 1;
const PAGER_DOT_SIZE = 6;
const PAGE_COUNT = 2;

type ShiftsEmptyStateProps = {
  onAddPress: () => void;
};

function PrimaryCta({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
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

/** Full-screen first-run state — no tab bar or page chrome. */
export function ShiftsEmptyState({ onAddPress }: ShiftsEmptyStateProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<RNScrollView>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;

  // Full-bleed pager; each page brings its own horizontal gutter so pages
  // don't sit flush against each other while swiping.
  const pageWidth = viewportSize.width;
  const pageHeight = viewportSize.height;
  const snapInterval = pageWidth;

  const onPagerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setViewportSize((prev) =>
      prev.width === nextWidth && prev.height === nextHeight
        ? prev
        : { width: nextWidth, height: nextHeight },
    );
  };

  const goToPage = (next: number) => {
    if (snapInterval === 0) {
      return;
    }
    const clamped = Math.max(0, Math.min(PAGE_COUNT - 1, next));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPageIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * snapInterval, animated: true });
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (snapInterval === 0) {
      return;
    }
    const next = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    if (next === pageIndex) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPageIndex(next);
  };

  const isLastPage = pageIndex >= PAGE_COUNT - 1;
  const ctaLabel = isLastPage ? t('shifts.emptyCta') : t('common.next');
  const onCtaPress = () => {
    if (isLastPage) {
      onAddPress();
      return;
    }
    goToPage(pageIndex + 1);
  };

  return (
    <View
      className="flex-1"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <View className="flex-1" onLayout={onPagerLayout}>
        {pageWidth > 0 && pageHeight > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            bounces={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
          >
            <PreviewPage
              language={language}
              width={pageWidth}
              height={pageHeight}
            />
            <InfoPage
              language={language}
              width={pageWidth}
              height={pageHeight}
            />
          </ScrollView>
        ) : null}
      </View>
      <View
        className="mt-4 gap-6"
        style={{
          paddingLeft: insets.left + SCREEN_GUTTER,
          paddingRight: insets.right + SCREEN_GUTTER,
        }}
      >
        <View className="flex-row items-center justify-center gap-2">
          {Array.from({ length: PAGE_COUNT }, (_, index) => (
            <View
              key={index}
              style={{
                width: PAGER_DOT_SIZE,
                height: PAGER_DOT_SIZE,
                borderRadius: PAGER_DOT_SIZE / 2,
                backgroundColor:
                  pageIndex === index ? colors.text : colors.bgPillTrack,
              }}
            />
          ))}
        </View>
        <PrimaryCta label={ctaLabel} onPress={onCtaPress} />
      </View>
    </View>
  );
}

function PreviewPage({
  language,
  width,
  height,
}: {
  language: AppLanguage;
  width: number;
  height: number;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const title = t('shifts.emptyTitle');
  const body = t('shifts.emptyBody');

  return (
    <ScrollView
      style={{ width, height }}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingLeft: insets.left + SCREEN_GUTTER,
        paddingRight: insets.right + SCREEN_GUTTER,
        paddingBottom: 8,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${body}`}
    >
      <CopyBlock title={title} body={body} />
      <View className="mt-8 w-full gap-5" style={{ opacity: GHOST_OPACITY }}>
        <GhostWeekendPreview
          language={language}
          caption={t('home.stats.nextFreeWeekend')}
        />
        <GhostCalendarPreview weekdayLabels={weekdayInitials(language)} />
        <GhostShiftsPreview caption={t('home.shiftsLeft')} />
      </View>
    </ScrollView>
  );
}

function InfoPage({
  language,
  width,
  height,
}: {
  language: AppLanguage;
  width: number;
  height: number;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const title = t('shifts.emptyInfoTitle');
  const body = t('shifts.emptyInfoBody');

  return (
    <ScrollView
      style={{ width, height }}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingLeft: insets.left + SCREEN_GUTTER,
        paddingRight: insets.right + SCREEN_GUTTER,
        paddingBottom: 8,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${body}`}
    >
      <CopyBlock title={title} body={body} />
      <View className="mt-8 w-full gap-5" style={{ opacity: GHOST_OPACITY }}>
        <GhostSharePreview />
        <GhostWidgetPreview language={language} />
      </View>
    </ScrollView>
  );
}

function CopyBlock({ title, body }: { title: string; body: string }) {
  const { colors } = useTheme();

  return (
    <View className="gap-2">
      <Text
        className="font-serif text-5xl tracking-tight"
        style={{ color: colors.text, textAlign: 'left' }}
      >
        {title}
      </Text>
      <Text
        className="font-mono text-base"
        style={{ color: colors.textMuted, textAlign: 'left' }}
      >
        {body}
      </Text>
    </View>
  );
}
