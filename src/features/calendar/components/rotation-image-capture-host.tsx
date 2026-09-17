import { useEffect, useRef, useState } from 'react';
import { View as RNView } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { View } from '../../../tw';
import type { RotationPeriod } from '../../rotations/types';
import { listShiftMonths } from '../../rotations/list-shift-months';
import { configureCalendarLocale } from '../configure-calendar-locale';
import {
  RotationShareImageCard,
  SHARE_IMAGE_WIDTH,
} from './rotation-share-image-card';
import { shareRotationImage } from '../share-rotation-image';

export type RotationImageShareRequest = {
  period: RotationPeriod;
};

type Props = {
  request: RotationImageShareRequest | null;
  language: AppLanguage;
  onComplete: (result: 'ok' | 'empty' | 'unavailable' | 'failed') => void;
};

/**
 * Off-screen host: mounts the share card, captures a PNG, opens the share sheet.
 * Parent should set `request` after any Modal has finished dismissing (iOS).
 */
export function RotationImageCaptureHost({
  request,
  language,
  onComplete,
}: Props) {
  const { t } = useTranslation();
  const cardRef = useRef<RNView>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [readyPeriod, setReadyPeriod] = useState<RotationPeriod | null>(null);
  const capturingRef = useRef(false);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  useEffect(() => {
    if (request == null) {
      setReadyPeriod(null);
      capturingRef.current = false;
      return;
    }
    if (listShiftMonths(request.period).length === 0) {
      onCompleteRef.current('empty');
      return;
    }
    capturingRef.current = false;
    setReadyPeriod(request.period);
  }, [request]);

  useEffect(() => {
    if (readyPeriod == null || capturingRef.current) {
      return;
    }
    capturingRef.current = true;
    let cancelled = false;

    const run = async () => {
      // Let calendars mount + layout before snapshotting.
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 250);
        });
      });
      if (cancelled) {
        return;
      }
      const result = await shareRotationImage(
        cardRef,
        readyPeriod.label,
        t('calendar.shareImageDialogTitle'),
      );
      if (cancelled) {
        return;
      }
      onCompleteRef.current(result.ok ? 'ok' : result.reason);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [readyPeriod, t]);

  if (readyPeriod == null) {
    return null;
  }

  // Keep the card fully opaque off-screen — opacity:0 can yield blank captures.
  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={{
        position: 'absolute',
        left: -SHARE_IMAGE_WIDTH * 2,
        top: 0,
      }}
    >
      <RNView ref={cardRef} collapsable={false}>
        <RotationShareImageCard period={readyPeriod} language={language} />
      </RNView>
    </View>
  );
}
