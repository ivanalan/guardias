import { differenceInCalendarDays, format } from 'date-fns';

import { calendarMarkColorsFor } from '../calendar/calendar-mark-colors';
import {
  dayNumber,
  getDayMarkKind,
  resolveShiftColor,
  resolveShiftTextColor,
  resolveVacationBackground,
  resolveVacationTextColor,
  resolveWeekendBackground,
} from '../calendar/calendar-day-marker';
import { getRangeMarkInputs } from '../calendar/month-legend-stats';
import {
  formatWeekdayLong,
  weekdayInitials,
} from '../dashboard/format-home-copy';
import { getWeekDates } from '../dashboard/two-week-dates';
import i18n, { resolveDeviceLanguage, type AppLanguage } from '../../i18n';
import {
  getHomepageShiftStatus,
  listUpcomingShifts,
} from '../../lib/shifts/get-homepage-shift-status';
import { loadRotationPeriods } from '../rotations/storage';
import {
  resolveRotationColor,
  resolveShiftMarks,
} from '../rotations/rotation-colors';
import type { RotationPeriod } from '../rotations/types';
import { loadAppPreferences } from '../settings/storage';
import {
  DARK_COLORS,
  LIGHT_COLORS,
  type ThemeColors,
  type ThemeScheme,
} from '../../theme/colors';

import type {
  HexColor,
  UpcomingShiftItemProps,
  UpcomingShiftsWidgetProps,
  TwoWeekWidgetProps,
  WidgetDayCellProps,
} from './types';
import { UPCOMING_SHIFTS_WIDGET_LIMIT } from './types';
import {
  resolveUpcomingShiftsLayout,
  type UpcomingShiftsLayout,
} from './upcoming-shifts-layout';
import {
  resolveTwoWeekLayout,
  type TwoWeekLayout,
} from './two-week-layout';

function asHex(value: string): HexColor {
  return value as HexColor;
}

function resolveLanguage(locale: AppLanguage | null | undefined): AppLanguage {
  return locale ?? resolveDeviceLanguage();
}

function colorsForScheme(scheme: ThemeScheme): ThemeColors {
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

function buildDayCell(
  iso: string,
  todayIso: string,
  shiftColorByDate: ReadonlyMap<string, string>,
  secondaryShiftColorByDate: ReadonlyMap<string, string>,
  freeWeekendDates: ReadonlySet<string>,
  vacationDates: ReadonlySet<string>,
  colors: ThemeColors,
): WidgetDayCellProps {
  const markColors = calendarMarkColorsFor(colors);
  const markCtx = {
    shiftColorByDate,
    freeWeekendSet: freeWeekendDates,
    vacationSet: vacationDates,
  };
  const markKind = getDayMarkKind(iso, markCtx);
  const isToday = iso === todayIso;
  const alpha = 1;
  const isShift = markKind === 'shift';
  const isVacation = markKind === 'vacation';
  const isWeekend = markKind === 'freeWeekend';
  const shiftColor = shiftColorByDate.get(iso);
  const secondaryColor = secondaryShiftColorByDate.get(iso);

  let backgroundColor: HexColor | null = null;
  if (isVacation) {
    backgroundColor = asHex(resolveVacationBackground(markColors, alpha));
  } else if (isShift && shiftColor != null) {
    backgroundColor = asHex(resolveShiftColor(shiftColor, alpha));
  } else if (isWeekend) {
    backgroundColor = asHex(resolveWeekendBackground(markColors, alpha));
  }

  let textColor: HexColor = asHex(colors.text);
  if (isVacation) {
    textColor = asHex(resolveVacationTextColor(markColors, alpha));
  } else if (isShift || isWeekend) {
    textColor = asHex(resolveShiftTextColor(markColors, alpha));
  }

  return {
    dayNumber: dayNumber(iso),
    isToday,
    kind: markKind,
    backgroundColor,
    textColor,
    borderColor: isToday ? asHex(colors.brand) : null,
    secondaryDotColor: secondaryColor != null ? asHex(secondaryColor) : null,
  };
}

/** Build two-week widget props for one color scheme from periods + language. */
export function buildTwoWeekWidgetPropsForScheme(
  periods: readonly RotationPeriod[],
  language: AppLanguage,
  scheme: ThemeScheme,
  now: Date = new Date(),
  layout: TwoWeekLayout = resolveTwoWeekLayout(168),
): TwoWeekWidgetProps {
  const colors = colorsForScheme(scheme);
  const todayIso = format(now, 'yyyy-MM-dd');
  const windowDates = getWeekDates(now, layout.weekCount);
  const windowStart = windowDates[0]!;
  const windowEnd = windowDates[windowDates.length - 1]!;
  const markInputs = getRangeMarkInputs(periods, windowStart, windowEnd);
  const resolvedShiftMarks = resolveShiftMarks(markInputs.shiftMarks, colors);
  const resolvedSecondary = resolveShiftMarks(
    markInputs.secondaryShiftMarks,
    colors,
  );
  const shiftColorByDate = new Map(
    resolvedShiftMarks.map((mark) => [mark.date, mark.color]),
  );
  // Widgets show one aggregated friend dot (first period in mark order).
  const secondaryShiftColorByDate = new Map<string, string>();
  for (const mark of resolvedSecondary) {
    if (!secondaryShiftColorByDate.has(mark.date)) {
      secondaryShiftColorByDate.set(mark.date, mark.color);
    }
  }
  const freeWeekendDates = new Set(markInputs.freeWeekendDates);
  const vacationDates = new Set(markInputs.vacationDates);

  const days = windowDates.map((iso) =>
    buildDayCell(
      iso,
      todayIso,
      shiftColorByDate,
      secondaryShiftColorByDate,
      freeWeekendDates,
      vacationDates,
      colors,
    ),
  );

  const weeks: WidgetDayCellProps[][] = [];
  for (let w = 0; w < layout.weekCount; w += 1) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  return {
    backgroundColor: asHex(colors.bg1),
    weekdayLabels: weekdayInitials(language),
    weekdayColor: asHex(colors.textMuted),
    weeks,
    cellSize: layout.cellSize,
    dayFontSize: layout.dayFontSize,
    weekdayFontSize: layout.weekdayFontSize,
    showWeekdayLetters: layout.showWeekdayLetters,
  };
}

export type TwoWeekWidgetThemeBundle = {
  light: TwoWeekWidgetProps;
  dark: TwoWeekWidgetProps;
  forcedScheme: ThemeScheme | null;
};

type WidgetStorageSnapshot = {
  periods: RotationPeriod[];
  language: AppLanguage;
  forcedScheme: ThemeScheme | null;
};

async function loadWidgetStorageSnapshot(
  periodsOverride?: readonly RotationPeriod[],
): Promise<WidgetStorageSnapshot> {
  const [storedPeriods, prefs] = await Promise.all([
    periodsOverride != null
      ? Promise.resolve([...periodsOverride])
      : loadRotationPeriods(),
    loadAppPreferences(),
  ]);
  const periods = storedPeriods ?? [];
  const language = resolveLanguage(prefs?.locale);
  const forcedScheme =
    prefs?.colorScheme === 'light' || prefs?.colorScheme === 'dark'
      ? prefs.colorScheme
      : null;
  return { periods, language, forcedScheme };
}

/** Load storage and build light + dark widget props. */
export async function loadTwoWeekWidgetThemeBundle(
  periodsOverride?: readonly RotationPeriod[],
  now: Date = new Date(),
  layout: TwoWeekLayout = resolveTwoWeekLayout(168),
): Promise<TwoWeekWidgetThemeBundle> {
  const { periods, language, forcedScheme } =
    await loadWidgetStorageSnapshot(periodsOverride);

  if (forcedScheme != null) {
    const props = buildTwoWeekWidgetPropsForScheme(
      periods,
      language,
      forcedScheme,
      now,
      layout,
    );
    return { light: props, dark: props, forcedScheme };
  }

  return {
    light: buildTwoWeekWidgetPropsForScheme(
      periods,
      language,
      'light',
      now,
      layout,
    ),
    dark: buildTwoWeekWidgetPropsForScheme(
      periods,
      language,
      'dark',
      now,
      layout,
    ),
    forcedScheme: null,
  };
}

function relativeShiftLabel(
  startDateTime: Date,
  now: Date,
  language: AppLanguage,
): string {
  const daysUntil = differenceInCalendarDays(startDateTime, now);
  if (daysUntil <= 0) {
    return i18n.t('home.inDaysToday', { lng: language });
  }
  return i18n.t('home.inDays', { count: daysUntil, lng: language });
}

/** Build upcoming-shifts widget props for one color scheme. */
export function buildUpcomingShiftsWidgetPropsForScheme(
  periods: readonly RotationPeriod[],
  language: AppLanguage,
  scheme: ThemeScheme,
  now: Date = new Date(),
  layout: UpcomingShiftsLayout = resolveUpcomingShiftsLayout(236),
): UpcomingShiftsWidgetProps {
  const colors = colorsForScheme(scheme);
  const status = getHomepageShiftStatus(periods, now);
  const items: UpcomingShiftItemProps[] =
    status.kind === 'idle'
      ? []
      : listUpcomingShifts(
          status.period,
          now,
          UPCOMING_SHIFTS_WIDGET_LIMIT,
        ).map((shift, index) => ({
          dayNumber: format(shift.startDateTime, 'd'),
          weekday: formatWeekdayLong(shift.startDateTime, language),
          relativeLabel: relativeShiftLabel(shift.startDateTime, now, language),
          isNext: index === 0,
        }));

  const accentSource =
    status.kind === 'idle' ? colors.accentRed : status.period.color;

  return {
    backgroundColor: asHex(colors.bg1),
    title: i18n.t('home.upcomingShifts', { lng: language }),
    titleColor: asHex(colors.textMuted),
    emptyCaption: i18n.t('home.stats.noneInPeriod', { lng: language }),
    emptyCaptionColor: asHex(colors.textMuted),
    items,
    maxItems: layout.maxItems,
    showRelative: layout.showRelative,
    accentColor: asHex(resolveRotationColor(accentSource, colors)),
    railMutedColor: asHex(colors.bgPillTrack),
    onAccentColor: asHex(colors.onColor),
    weekdayColor: asHex(colors.text),
    relativeColor: asHex(colors.textMuted),
  };
}

export type UpcomingShiftsWidgetThemeBundle = {
  light: UpcomingShiftsWidgetProps;
  dark: UpcomingShiftsWidgetProps;
  forcedScheme: ThemeScheme | null;
};

/** Load storage and build light + dark upcoming-shifts widget props. */
export async function loadUpcomingShiftsWidgetThemeBundle(
  periodsOverride?: readonly RotationPeriod[],
  now: Date = new Date(),
  layout: UpcomingShiftsLayout = resolveUpcomingShiftsLayout(236),
): Promise<UpcomingShiftsWidgetThemeBundle> {
  const { periods, language, forcedScheme } =
    await loadWidgetStorageSnapshot(periodsOverride);

  if (forcedScheme != null) {
    const props = buildUpcomingShiftsWidgetPropsForScheme(
      periods,
      language,
      forcedScheme,
      now,
      layout,
    );
    return { light: props, dark: props, forcedScheme };
  }

  return {
    light: buildUpcomingShiftsWidgetPropsForScheme(
      periods,
      language,
      'light',
      now,
      layout,
    ),
    dark: buildUpcomingShiftsWidgetPropsForScheme(
      periods,
      language,
      'dark',
      now,
      layout,
    ),
    forcedScheme: null,
  };
}
