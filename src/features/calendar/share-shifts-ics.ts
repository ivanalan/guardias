import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { RotationPeriod } from '../rotations/types';

import { buildShiftsIcs } from './build-shifts-ics';
import { guardiasIcsBasename } from './guardias-ics-basename';

export type ShareShiftsIcsResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'unavailable' };

/**
 * Writes one recurring `.ics` series for a period and opens the share sheet.
 */
export async function shareShiftsIcs(
  period: RotationPeriod,
  dialogTitle: string,
): Promise<ShareShiftsIcsResult> {
  const { ics, eventCount } = buildShiftsIcs(period);
  if (eventCount === 0) {
    return { ok: false, reason: 'empty' };
  }

  if (!(await Sharing.isAvailableAsync())) {
    return { ok: false, reason: 'unavailable' };
  }

  const file = new File(Paths.cache, `${guardiasIcsBasename(period.label)}.ics`);
  file.create({ overwrite: true });
  file.write(ics);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/calendar',
    UTI: 'com.apple.ical.ics',
    dialogTitle,
  });

  return { ok: true };
}
