import { useEffect, useState, type RefObject } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type View as RNView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Mask, Rect } from 'react-native-svg';

import { ANDROID_TEXT_WIDTH_BUMP } from '../../../theme/android-text';
import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';

const CUTOUT_PADDING = 10;
const TOOLTIP_GAP = 12;
const TOOLTIP_MAX_WIDTH = 280;

type TargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ShareCoachMarkProps = {
  visible: boolean;
  targetRef: RefObject<RNView | null>;
  onDismiss: () => void;
  onTargetPress: () => void;
};

/**
 * One-step spotlight coach for the Home share control.
 * Circular cutout over the target; hole opens share, scrim / buttons dismiss.
 */
export function ShareCoachMark({
  visible,
  targetRef,
  onDismiss,
  onTargetPress,
}: ShareCoachMarkProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [target, setTarget] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (!visible) {
      setTarget(null);
      return;
    }

    let cancelled = false;
    const measure = () => {
      targetRef.current?.measureInWindow((x, y, width, height) => {
        if (cancelled || width <= 0 || height <= 0) {
          return;
        }
        // Android measureInWindow is below the status bar; Modal is edge-to-edge.
        const yAdj = Platform.OS === 'android' ? y + insets.top : y;
        setTarget({ x, y: yAdj, width, height });
      });
    };

    const timer = setTimeout(measure, 32);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [visible, targetRef, insets.top, screenW, screenH]);

  if (!visible) {
    return null;
  }

  const diameter =
    target != null
      ? Math.max(target.width, target.height) + CUTOUT_PADDING * 2
      : 0;
  const cx = target != null ? target.x + target.width / 2 : 0;
  const cy = target != null ? target.y + target.height / 2 : 0;
  const holeLeft = cx - diameter / 2;
  const holeTop = cy - diameter / 2;

  const tooltipTop =
    target != null
      ? Math.min(
          holeTop + diameter + TOOLTIP_GAP,
          screenH - insets.bottom - 160,
        )
      : insets.top + 80;
  const tooltipLeft =
    target != null
      ? Math.max(
          insets.left + 16,
          Math.min(
            holeLeft + diameter - TOOLTIP_MAX_WIDTH,
            screenW - insets.right - 16 - TOOLTIP_MAX_WIDTH,
          ),
        )
      : 16;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Svg
          width={screenW}
          height={screenH}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          {target != null ? (
            <>
              <Defs>
                <Mask id="shareCoachHole">
                  <Rect width={screenW} height={screenH} fill="#fff" />
                  <Circle cx={cx} cy={cy} r={diameter / 2} fill="#000" />
                </Mask>
              </Defs>
              <Rect
                width={screenW}
                height={screenH}
                fill={colors.scrim}
                mask="url(#shareCoachHole)"
              />
            </>
          ) : (
            <Rect width={screenW} height={screenH} fill={colors.scrim} />
          )}
        </Svg>

        {/* Full-screen dismiss; hole + tooltip sit above and take presses first. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.shareCoach.gotIt')}
          onPress={onDismiss}
          style={StyleSheet.absoluteFill}
        />

        {target != null ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('shifts.detail.shareA11y')}
              onPress={onTargetPress}
              style={{
                position: 'absolute',
                left: holeLeft,
                top: holeTop,
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                zIndex: 2,
              }}
            />

            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: holeLeft,
                top: holeTop,
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                borderWidth: 2,
                borderColor: colors.brand,
                zIndex: 2,
              }}
            />
          </>
        ) : null}

        <View
          className="absolute gap-3 rounded-2xl p-4"
          style={{
            top: tooltipTop,
            left: tooltipLeft,
            width: TOOLTIP_MAX_WIDTH,
            maxWidth: screenW - 32,
            borderCurve: 'continuous',
            backgroundColor: colors.bg1,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            zIndex: 3,
          }}
          pointerEvents="box-none"
        >
          <View className="gap-1.5" pointerEvents="none">
            <Text
              className="font-serif text-xl leading-tight"
              style={{ color: colors.text }}
            >
              {t('home.shareCoach.title')}
            </Text>
            <Text
              className="font-mono text-sm leading-5"
              style={{
                ...ANDROID_TEXT_WIDTH_BUMP,
                color: colors.textMuted,
              }}
            >
              {t('home.shareCoach.body')}
            </Text>
          </View>
          <View className="flex-row items-center justify-end">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.shareCoach.gotIt')}
              onPress={onDismiss}
              className="rounded-xl px-3.5 py-2.5 active:opacity-80"
              style={{
                borderCurve: 'continuous',
                backgroundColor: colors.brand,
              }}
            >
              <Text
                className="font-mono text-sm"
                style={{
                  ...ANDROID_TEXT_WIDTH_BUMP,
                  color: colors.textInverse,
                }}
              >
                {t('home.shareCoach.gotIt')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
