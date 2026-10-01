import { useEffect, useRef, type RefObject } from 'react';
import { Alert } from 'react-native';
import type { NavigationContainerRef } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

import { parseShareUrl } from '../features/rotations/share-rotation-link';
import type { TabParamList } from './types';

function isSharePath(url: string): boolean {
  try {
    const parsed = Linking.parse(url);
    const path = (parsed.path ?? '').replace(/\/+$/, '');
    return (
      path === 'guardias/r' ||
      path.endsWith('/guardias/r') ||
      path === 'r' ||
      url.includes('/guardias/r')
    );
  } catch {
    return url.includes('/guardias/r');
  }
}

/**
 * Opens Add Rotation prefilled when a share custom-scheme URL arrives
 * (`miguardia://guardias/r/?d=…`), e.g. from the website “Interdía App” button.
 */
export function useShareLinkNavigation(
  navigationRef: RefObject<NavigationContainerRef<TabParamList> | null>,
) {
  const { t } = useTranslation();
  const handledInitial = useRef(false);

  useEffect(() => {
    function openShareUrl(url: string | null) {
      if (url == null || !isSharePath(url)) {
        return;
      }
      const draft = parseShareUrl(url);
      if (draft == null) {
        Alert.alert(
          t('shifts.detail.shareInvalidTitle'),
          t('shifts.detail.shareInvalidBody'),
        );
        return;
      }
      navigationRef.current?.navigate('Shifts', {
        screen: 'AddRotation',
        params: { draft },
      });
    }

    void Linking.getInitialURL().then((url) => {
      if (handledInitial.current) {
        return;
      }
      handledInitial.current = true;
      openShareUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      openShareUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [navigationRef, t]);
}
