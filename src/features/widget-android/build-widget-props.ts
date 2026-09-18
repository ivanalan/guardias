import { format } from 'date-fns';

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
import { weekdayInitials } from '../dashboard/format-home-copy';
import { getTwoWeekDates } from '../dashboard/two-week-dates';
import i18n, { resolveDeviceLanguage, type AppLanguage } from '../../i18n';
import { getHomepageShiftStatus } from '../../lib/shifts/get-homepage-shift-status';
import { primaryPeriods } from '../rotations/period-role';
import { loadRotationPeriods } from '../rotations/storage';
import { resolveShiftMarks } from '../rotations/rotation-colors';
import type { RotationPeriod } from '../rotations/types';
import { loadAppPreferences } from '../settings/storage';
import {
  DARK_COLORS,
  LIGHT_COLORS,
  type ThemeColors,
  type ThemeScheme,
} from '../../theme/colors';

import type { HexColor, TwoWeekWidgetProps, WidgetDayCellProps } from './types';

function asHex(value: string): HexColor {
  return value as HexColor;
}

function resolveLanguage(locale: AppLanguage | null | undefined): AppLanguage {
  return locale ?? resolveDeviceLanguage();
}

function colorsForScheme(scheme: ThemeScheme): ThemeColors {
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

/** Home-active primary rotation label, or empty-state fallback. */
export function widgetRotationTitle(
  periods: readonly RotationPeriod[],
  now: Date,
  language: AppLanguage,
): string {
  const status = getHomepageShiftStatus(periods, now);
  if (status.kind !== 'idle') {
    const label = status.period.label.trim();
    if (label !== '') {
      return label;
    }
  }
  const primary = primaryPeriods(periods)[0];
  if (primary != null) {
    const label = primary.label.trim();
    if (label !== '') {
      return label;
    }
  }
  return i18n.t('widget.twoWeek.noRotation', { lng: language });
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
): TwoWeekWidgetProps {
  const colors = colorsForScheme(scheme);
  const todayIso = format(now, 'yyyy-MM-dd');
  const windowDates = getTwoWeekDates(now);
  const windowStart = windowDates[0]!;
  const windowEnd = windowDates[13]!;
  const markInputs = getRangeMarkInputs(periods, windowStart, windowEnd);
  const resolvedShiftMarks = resolveShiftMarks(markInputs.shiftMarks, colors);
  const resolvedSecondary = resolveShiftMarks(
    markInputs.secondaryShiftMarks,
    colors,
  );
  const shiftColorByDate = new Map(
    resolvedShiftMarks.map((mark) => [mark.date, mark.color]),
  );
  const secondaryShiftColorByDate = new Map(
    resolvedSecondary.map((mark) => [mark.date, mark.color]),
  );
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

  return {
    backgroundColor: asHex(colors.bg1),
    title: widgetRotationTitle(periods, now, language),
    titleColor: asHex(colors.text),
    weekdayLabels: weekdayInitials(language),
    weekdayColor: asHex(colors.textMuted),
    weeks: [days.slice(0, 7), days.slice(7, 14)] as [
      WidgetDayCellProps[],
      WidgetDayCellProps[],
    ],
  };
}

export type TwoWeekWidgetThemeBundle = {
  light: TwoWeekWidgetProps;
  dark: TwoWeekWidgetProps;
  forcedScheme: ThemeScheme | null;
};

/** Load storage and build light + dark widget props. */
export async function loadTwoWeekWidgetThemeBundle(
  periodsOverride?: readonly RotationPeriod[],
  now: Date = new Date(),
): Promise<TwoWeekWidgetThemeBundle> {
  const [storedPeriods, prefs] = await Promise.all([
    periodsOverride != null
      ? Promise.resolve([...periodsOverride])
      : loadRotationPeriods(),
    loadAppPreferences(),
  ]);
  const periods = storedPeriods ?? [];
  const language = resolveLanguage(prefs?.locale);
  const forced =
    prefs?.colorScheme === 'light' || prefs?.colorScheme === 'dark'
      ? prefs.colorScheme
      : null;

  if (forced != null) {
    const props = buildTwoWeekWidgetPropsForScheme(
      periods,
      language,
      forced,
      now,
    );
    return { light: props, dark: props, forcedScheme: forced };
  }

  return {
    light: buildTwoWeekWidgetPropsForScheme(periods, language, 'light', now),
    dark: buildTwoWeekWidgetPropsForScheme(periods, language, 'dark', now),
    forcedScheme: null,
  };
}
