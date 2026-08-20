import { DEFAULT_ROTATION_COLOR } from '../features/rotations/rotation-colors';
import { DEFAULT_ACCENT_TINTS, getAccentTints } from './accent-tints';

function hexDistance(a: string, b: string): number {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  return Math.abs(ar - br) + Math.abs(ag - bg) + Math.abs(ab - bb);
}

describe('getAccentTints', () => {
  it('matches DEFAULT_ACCENT_TINTS when base is DEFAULT_ROTATION_COLOR', () => {
    const accents = getAccentTints(DEFAULT_ROTATION_COLOR);
    expect(accents.brand.toUpperCase()).toBe(
      DEFAULT_ROTATION_COLOR.toUpperCase(),
    );
    for (const key of ['violet', 'indigo', 'azure', 'teal'] as const) {
      expect(hexDistance(accents[key], DEFAULT_ACCENT_TINTS[key])).toBeLessThanOrEqual(
        3,
      );
    }
  });

  it('keeps brand equal to the input for a non-default swatch', () => {
    const rose = '#D81B60';
    const accents = getAccentTints(rose);
    expect(accents.brand.toUpperCase()).toBe(rose);
    expect(accents.violet.toUpperCase()).not.toBe(
      DEFAULT_ACCENT_TINTS.violet.toUpperCase(),
    );
    expect(accents.teal.toUpperCase()).not.toBe(
      DEFAULT_ACCENT_TINTS.teal.toUpperCase(),
    );
  });

  it('falls back to default guardia accents for invalid hex', () => {
    expect(getAccentTints('not-a-color')).toEqual({ ...DEFAULT_ACCENT_TINTS });
  });
});
