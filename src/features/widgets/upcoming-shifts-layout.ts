/**
 * Height-driven layout for the upcoming-shifts timeline list.
 * Stays single-column at every width; only row count / secondary text change.
 */
export type UpcomingShiftsLayout = {
  maxItems: number;
  showRelative: boolean;
};

/** Compact ≈2×2, tall ≈2×3+. Heights are widget dp from WidgetInfo. */
export function resolveUpcomingShiftsLayout(
  heightDp: number,
): UpcomingShiftsLayout {
  if (heightDp < 130) {
    return { maxItems: 4, showRelative: false };
  }
  if (heightDp < 280) {
    return { maxItems: 4, showRelative: true };
  }
  return { maxItems: 6, showRelative: true };
}
