import {
  buildShareUrl,
  parseShareDraft,
  parseShareUrl,
  periodToShareDraft,
  SHARE_LINK_ORIGIN,
  SHARE_LINK_PATH,
} from './share-rotation-link';
import type { RotationPeriod } from './types';
import { DEFAULT_ROTATION_COLOR } from './rotation-colors';

function period(
  overrides: Partial<RotationPeriod> = {},
): RotationPeriod {
  return {
    id: 'p1',
    label: 'Emergency room',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    pattern: { cycleDays: 4, offset: 'B' },
    firstShiftDate: '2026-07-02',
    vacationStartDate: '2026-08-01',
    vacationEndDate: '2026-08-07',
    shiftStartTime: '07:00',
    color: DEFAULT_ROTATION_COLOR,
    role: 'secondary',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('periodToShareDraft', () => {
  it('omits id and createdAt and keeps schedule fields', () => {
    const draft = periodToShareDraft(period());
    expect(draft).toEqual({
      label: 'Emergency room',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      pattern: { cycleDays: 4, offset: 'B' },
      firstShiftDate: '2026-07-02',
      vacationStartDate: '2026-08-01',
      vacationEndDate: '2026-08-07',
      shiftStartTime: '07:00',
      color: DEFAULT_ROTATION_COLOR,
    });
    expect(draft).not.toHaveProperty('id');
    expect(draft).not.toHaveProperty('createdAt');
    expect(draft).not.toHaveProperty('role');
  });
});

describe('buildShareUrl / parseShareUrl', () => {
  it('round-trips through an https share URL', () => {
    const url = buildShareUrl(period());
    expect(url.startsWith(`${SHARE_LINK_ORIGIN}${SHARE_LINK_PATH}?d=`)).toBe(
      true,
    );
    const draft = parseShareUrl(url);
    expect(draft).toEqual(periodToShareDraft(period()));
  });

  it('uses a trailing-slash path (no Astro 301)', () => {
    const url = buildShareUrl(period());
    expect(url.startsWith(`${SHARE_LINK_ORIGIN}/guardias/r/?d=`)).toBe(true);
  });

  it('parses custom-scheme fallback URLs', () => {
    const httpsUrl = buildShareUrl(period());
    const payload = new URL(httpsUrl).searchParams.get('d');
    const draft = parseShareUrl(`miguardia://guardias/r/?d=${payload}`);
    expect(draft?.label).toBe('Emergency room');
  });

  it('returns null for missing or garbage payloads', () => {
    expect(parseShareUrl(`${SHARE_LINK_ORIGIN}${SHARE_LINK_PATH}`)).toBeNull();
    expect(
      parseShareUrl(`${SHARE_LINK_ORIGIN}${SHARE_LINK_PATH}?d=%%%`),
    ).toBeNull();
  });
});

describe('parseShareDraft', () => {
  it('rejects invalid pattern letters for A-C', () => {
    expect(
      parseShareDraft({
        label: 'X',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        pattern: { cycleDays: 3, offset: 'D' },
        firstShiftDate: null,
        vacationStartDate: null,
        vacationEndDate: null,
        shiftStartTime: '07:00',
        color: DEFAULT_ROTATION_COLOR,
      }),
    ).toBeNull();
  });

  it('rejects empty labels', () => {
    expect(
      parseShareDraft({
        ...periodToShareDraft(period()),
        label: '   ',
      }),
    ).toBeNull();
  });
});
