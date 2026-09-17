import {
  DEFAULT_SHIFT_START_TIME,
  OFFSETS_FOR_CYCLE,
  type CycleDays,
  type OffsetLetter,
  type RotationPeriod,
} from './types';
import { isRotationColor, normalizeRotationColor } from './rotation-colors';

/** Hosted share path on alanmatias.com (website landing; app opens via custom scheme). */
export const SHARE_LINK_ORIGIN = 'https://alanmatias.com';
/** Trailing slash avoids Astro’s 301 `/guardias/r` → `/guardias/r/`. */
export const SHARE_LINK_PATH = '/guardias/r/';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HH_MM = /^\d{2}:\d{2}$/;

/**
 * Rotation fields encoded in a share URL (no `id` / `createdAt`).
 * Receivers always open as a primary clone.
 */
export type SharedRotationDraft = {
  label: string;
  startDate: string;
  endDate: string;
  pattern: {
    cycleDays: CycleDays;
    offset: OffsetLetter;
  };
  firstShiftDate: string | null;
  vacationStartDate: string | null;
  vacationEndDate: string | null;
  shiftStartTime: string;
  color: string;
};

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value);
}

function isNullableIsoDate(value: unknown): value is string | null {
  return value === null || isIsoDate(value);
}

function isCycleDays(value: unknown): value is CycleDays {
  return value === 3 || value === 4;
}

function isOffsetLetter(
  value: unknown,
  cycleDays: CycleDays,
): value is OffsetLetter {
  return (
    typeof value === 'string' &&
    (OFFSETS_FOR_CYCLE[cycleDays] as readonly string[]).includes(value)
  );
}

function encodeBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(payload: string): string | null {
  try {
    const padded =
      payload.replace(/-/g, '+').replace(/_/g, '/') +
      '==='.slice((payload.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Build a shareable draft from a stored period (always primary on receive). */
export function periodToShareDraft(period: RotationPeriod): SharedRotationDraft {
  return {
    label: period.label,
    startDate: period.startDate,
    endDate: period.endDate,
    pattern: {
      cycleDays: period.pattern.cycleDays,
      offset: period.pattern.offset,
    },
    firstShiftDate: period.firstShiftDate,
    vacationStartDate: period.vacationStartDate,
    vacationEndDate: period.vacationEndDate,
    shiftStartTime: period.shiftStartTime,
    color: normalizeRotationColor(period.color),
  };
}

/** Validate and normalize an unknown payload into a share draft. */
export function parseShareDraft(raw: unknown): SharedRotationDraft | null {
  if (raw == null || typeof raw !== 'object') {
    return null;
  }
  const data = raw as Record<string, unknown>;
  const patternRaw = data.pattern;
  if (patternRaw == null || typeof patternRaw !== 'object') {
    return null;
  }
  const pattern = patternRaw as Record<string, unknown>;
  if (!isCycleDays(pattern.cycleDays)) {
    return null;
  }
  if (!isOffsetLetter(pattern.offset, pattern.cycleDays)) {
    return null;
  }
  if (typeof data.label !== 'string' || data.label.trim().length === 0) {
    return null;
  }
  if (!isIsoDate(data.startDate) || !isIsoDate(data.endDate)) {
    return null;
  }
  if (!isNullableIsoDate(data.firstShiftDate)) {
    return null;
  }
  if (!isNullableIsoDate(data.vacationStartDate)) {
    return null;
  }
  if (!isNullableIsoDate(data.vacationEndDate)) {
    return null;
  }
  const shiftStartTime =
    typeof data.shiftStartTime === 'string' && HH_MM.test(data.shiftStartTime)
      ? data.shiftStartTime
      : DEFAULT_SHIFT_START_TIME;
  const color = isRotationColor(data.color)
    ? data.color
    : normalizeRotationColor(data.color);

  return {
    label: data.label.trim(),
    startDate: data.startDate,
    endDate: data.endDate,
    pattern: {
      cycleDays: pattern.cycleDays,
      offset: pattern.offset,
    },
    firstShiftDate: data.firstShiftDate,
    vacationStartDate: data.vacationStartDate,
    vacationEndDate: data.vacationEndDate,
    shiftStartTime,
    color,
  };
}

/** HTTPS share URL with base64url JSON payload in `d`. */
export function buildShareUrl(period: RotationPeriod): string {
  const draft = periodToShareDraft(period);
  const encoded = encodeBase64Url(JSON.stringify(draft));
  return `${SHARE_LINK_ORIGIN}${SHARE_LINK_PATH}?d=${encoded}`;
}

/**
 * Parse a share URL (full URL or path+query). Returns null when invalid.
 * Custom scheme fallback: `miguardia://guardias/r?d=…`
 */
export function parseShareUrl(url: string): SharedRotationDraft | null {
  try {
    const normalized = url.includes('://')
      ? url
      : `${SHARE_LINK_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
    const parsed = new URL(normalized);
    const payload = parsed.searchParams.get('d');
    if (payload == null || payload.length === 0) {
      return null;
    }
    const json = decodeBase64Url(payload);
    if (json == null) {
      return null;
    }
    return parseShareDraft(JSON.parse(json) as unknown);
  } catch {
    return null;
  }
}
