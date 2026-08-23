export type ThemeScheme = 'light' | 'dark';

/** Semantic color roles for the active scheme. */
export type ThemeColors = {
  bg: string;
  bg1: string;
  text: string;
  brand: string;
  textInverse: string;
  /** Text on saturated shift / mark / rotation fills — white in both schemes. */
  onColor: string;
  bgWeekend: string;
  /** Unfilled progress-pill track (shifts-left widget). */
  bgPillTrack: string;
  textMuted: string;
  textDisabled: string;
  border: string;
  bgVacation: string;
  scrim: string;
  tabInactive: string;
  tabBarOverlay: string;
  switchTrackOff: string;
};

export type BrandSelection = {
  background: string;
  backgroundSubtle: string;
  border: string;
  foreground: string;
};

export const LIGHT_COLORS: ThemeColors = {
  bg: '#F6F1EC',
  bg1: '#FFFFFF',
  text: '#1C1B1F',
  brand: '#1C1B1F',
  textInverse: '#F4F0F0',
  onColor: '#FFFFFF',
  bgWeekend: '#085D3A',
  bgPillTrack: '#E8E4DF',
  textMuted: '#49454F',
  textDisabled: '#C4C4C4',
  border: '#E5E5E5',
  bgVacation: '#4A47EF',
  scrim: 'rgba(0, 0, 0, 0.4)',
  tabInactive: '#49454F',
  tabBarOverlay: 'rgba(255, 255, 255, 0.45)',
  switchTrackOff: '#D4D4D4',
};

export const DARK_COLORS: ThemeColors = {
  bg: '#171616',
  bg1: '#2A2927',
  text: '#E8DFDF',
  brand: '#E8DFDF',
  textInverse: '#1C1B1F',
  onColor: '#FFFFFF',
  bgWeekend: '#053C25',
  bgPillTrack: '#444444',
  textMuted: '#A8A29E',
  textDisabled: '#5C5C5C',
  border: '#3F3F3F',
  bgVacation: '#4A47EF',
  scrim: 'rgba(0, 0, 0, 0.6)',
  tabInactive: '#A8A29E',
  tabBarOverlay: 'rgba(42, 41, 39, 0.55)',
  switchTrackOff: '#3F3F3F',
};

export function colorsFor(scheme: ThemeScheme): ThemeColors {
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

export function brandSelection(colors: ThemeColors): BrandSelection {
  return {
    background: `${colors.brand}14`,
    backgroundSubtle: `${colors.brand}0A`,
    border: colors.brand,
    foreground: colors.brand,
  };
}
