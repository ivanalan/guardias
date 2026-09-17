import { useEffect, useRef, useState } from 'react';
import {
  View as RNView,
  type LayoutChangeEvent,
} from 'react-native';
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
import {
  shareRotationImage,
  type ShareRotationImageOutcome,
} from '../share-rotation-image';

export type RotationImageShareRequest = {
  period: RotationPeriod;
};

type Props = {
  request: RotationImageShareRequest | null;
  language: AppLanguage;
  onComplete: (result: ShareRotationImageOutcome) => void;
};

type CaptureJob = {
  id: number;
  period: RotationPeriod;
};

/**
 * Off-screen host: mounts the share card, captures a PNG, saves to Photos
 * (or falls back to the share sheet). Parent should set `request` after any
 * Modal has finished dismissing (iOS).
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
  const dialogTitleRef = useRef(t('calendar.shareImageDialogTitle'));
  dialogTitleRef.current = t('calendar.shareImageDialogTitle');
  const generationRef = useRef(0);
  const [job, setJob] = useState<CaptureJob | null>(null);
  const startedForIdRef = useRef<number | null>(null);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  useEffect(() => {
    if (request == null) {
      generationRef.current += 1;
      startedForIdRef.current = null;
      setJob(null);
      return;
    }
    if (listShiftMonths(request.period).length === 0) {
      onCompleteRef.current('empty');
      return;
    }
    const id = generationRef.current + 1;
    generationRef.current = id;
    startedForIdRef.current = null;
    setJob({ id, period: request.period });
  }, [request]);

  const startCapture = (layoutJob: CaptureJob) => {
    if (startedForIdRef.current === layoutJob.id) {
      return;
    }
    startedForIdRef.current = layoutJob.id;
    const captureId = layoutJob.id;
    const label = layoutJob.period.label;

    void (async () => {
      // Brief settle after first non-zero layout so calendars finish painting.
      await new Promise((resolve) => {
        setTimeout(resolve, 120);
      });
      if (generationRef.current !== captureId) {
        return;
      }
      const result = await shareRotationImage(
        cardRef,
        label,
        dialogTitleRef.current,
      );
      if (generationRef.current !== captureId) {
        return;
      }
      onCompleteRef.current(result.ok ? result.method : result.reason);
    })();
  };

  const onCardLayout = (event: LayoutChangeEvent) => {
    if (job == null) {
      return;
    }
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }
    startCapture(job);
  };

  if (job == null) {
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
      <RNView
        ref={cardRef}
        collapsable={false}
        onLayout={onCardLayout}
      >
        <RotationShareImageCard period={job.period} language={language} />
      </RNView>
    </View>
  );
}
