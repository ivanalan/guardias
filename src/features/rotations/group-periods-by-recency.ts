import type { RotationPeriod } from './types';

export type PeriodRecencyKey = 'current' | 'future' | 'past';

export type PeriodRecencySection = {
  key: PeriodRecencyKey;
  /** i18n key under `shifts.*` */
  titleKey: 'sectionCurrent' | 'sectionFuture' | 'sectionPast';
  data: RotationPeriod[];
};

const SECTION_ORDER: readonly {
  key: PeriodRecencyKey;
  titleKey: PeriodRecencySection['titleKey'];
}[] = [
  { key: 'current', titleKey: 'sectionCurrent' },
  { key: 'future', titleKey: 'sectionFuture' },
  { key: 'past', titleKey: 'sectionPast' },
];

/**
 * Groups periods into Current → Future → Past for a SectionList.
 * Expects periods already sorted ascending by `startDate`.
 * Current lists own (primary) rotations before friend (secondary) shifts.
 * Past is shown newest-ended first (`endDate` descending).
 * Empty buckets are omitted.
 */
export function groupPeriodsByRecency(
  periods: readonly RotationPeriod[],
  todayIso: string,
): PeriodRecencySection[] {
  const buckets: Record<PeriodRecencyKey, RotationPeriod[]> = {
    current: [],
    future: [],
    past: [],
  };

  for (const period of periods) {
    if (period.endDate < todayIso) {
      buckets.past.push(period);
    } else if (period.startDate > todayIso) {
      buckets.future.push(period);
    } else {
      buckets.current.push(period);
    }
  }

  // Own rotations before friend shifts; keep startDate order within each role.
  buckets.current.sort((a, b) => {
    const roleRank = (a.role === 'primary' ? 0 : 1) - (b.role === 'primary' ? 0 : 1);
    if (roleRank !== 0) return roleRank;
    return a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0;
  });

  buckets.past.sort((a, b) => (a.endDate < b.endDate ? 1 : a.endDate > b.endDate ? -1 : 0));

  return SECTION_ORDER.flatMap(({ key, titleKey }) => {
    const data = buckets[key];
    if (data.length === 0) return [];
    return [{ key, titleKey, data }];
  });
}
