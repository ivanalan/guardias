import { Directory, File, Paths } from 'expo-file-system';
// Use legacy — default import needs ExpoMediaLibraryNext (not in Expo Go).
import {
  requestPermissionsAsync,
  saveToLibraryAsync,
} from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { guardiasImageFilename } from './guardias-ics-basename';

export type ShareRotationImageResult =
  | { ok: true; method: 'saved' | 'shared' }
  | { ok: false; reason: 'empty' | 'unavailable' | 'failed' };

export type ShareRotationImageOutcome =
  | 'saved'
  | 'shared'
  | 'empty'
  | 'unavailable'
  | 'failed';

type CaptureTarget = RefObject<View | null>;

/**
 * Captures a mounted share card, saves it to Photos when allowed, otherwise
 * opens the system share sheet.
 */
export async function shareRotationImage(
  viewRef: CaptureTarget,
  label: string,
  dialogTitle: string,
): Promise<ShareRotationImageResult> {
  if (viewRef.current == null) {
    return { ok: false, reason: 'failed' };
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

    // Unique dir per attempt avoids locked-file failures after a prior share.
    const dir = new Directory(Paths.cache, `share-img-${Date.now()}`);
    dir.create();
    const named = new File(dir, guardiasImageFilename(label));
    source.copy(named);

    const permission = await requestPermissionsAsync(true);
    if (permission.status === 'granted') {
      await saveToLibraryAsync(named.uri);
      return { ok: true, method: 'saved' };
    }

    if (!(await Sharing.isAvailableAsync())) {
      return { ok: false, reason: 'unavailable' };
    }

    await Sharing.shareAsync(named.uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle,
    });
    return { ok: true, method: 'shared' };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
