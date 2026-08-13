import { BRAND_ACCENT_TINTS, BRAND_COLOR } from './brand';
import { getAccentTints } from './accent-tints';

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
  it('matches BRAND_ACCENT_TINTS when base is BRAND_COLOR', () => {
    const accents = getAccentTints(BRAND_COLOR);
    expect(accents.brand.toUpperCase()).toBe(BRAND_COLOR.toUpperCase());
    for (const key of ['violet', 'indigo', 'azure', 'teal'] as const) {
      expect(hexDistance(accents[key], BRAND_ACCENT_TINTS[key])).toBeLessThanOrEqual(
        3,
      );
    }
  });

  it('keeps brand equal to the input for a non-blue swatch', () => {
    const rose = '#D81B60';
    const accents = getAccentTints(rose);
    expect(accents.brand.toUpperCase()).toBe(rose);
    expect(accents.violet.toUpperCase()).not.toBe(
      BRAND_ACCENT_TINTS.violet.toUpperCase(),
    );
    expect(accents.teal.toUpperCase()).not.toBe(
      BRAND_ACCENT_TINTS.teal.toUpperCase(),
    );
  });

  it('falls back to brand accents for invalid hex', () => {
    expect(getAccentTints('not-a-color')).toEqual({ ...BRAND_ACCENT_TINTS });
  });
});
