import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { guardiasImageFilename } from './guardias-ics-basename';

export type ShareRotationImageResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'unavailable' | 'failed' };

type CaptureTarget = RefObject<View | null>;

/**
 * Captures a mounted share card and opens the system share sheet (Save Image /
 * Messages / WhatsApp / etc.).
 */
export async function shareRotationImage(
  viewRef: CaptureTarget,
  label: string,
  dialogTitle: string,
): Promise<ShareRotationImageResult> {
  if (viewRef.current == null) {
    return { ok: false, reason: 'failed' };
  }

  if (!(await Sharing.isAvailableAsync())) {
    return { ok: false, reason: 'unavailable' };
  }

  try {
    const capturedUri = await captureRef(viewRef, {
      result: 'tmpfile',
      format: 'png',
      quality: 1,
    });
    const sourceUri = capturedUri.startsWith('file://')
      ? capturedUri
      : `file://${capturedUri}`;
    const source = new File(sourceUri);
    const named = new File(Paths.cache, guardiasImageFilename(label));
    if (named.exists) {
      named.delete();
    }
    source.copy(named);

    await Sharing.shareAsync(named.uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle,
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
