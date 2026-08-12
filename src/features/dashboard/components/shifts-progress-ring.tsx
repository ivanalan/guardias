import { useEffect, useRef, useState, type ReactNode } from 'react';
import Svg, { Circle } from 'react-native-svg';

import { BRAND_COLOR } from '../../../theme/brand';
import { View } from '../../../tw';

const DEFAULT_SIZE = 240;
const DEFAULT_STROKE = 28;
const ANIM_MS = 900;

type ShiftsProgressRingProps = {
  /** Fill amount from 0 to 1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: ReactNode;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Thick Health-style progress ring via react-native-svg (Expo Go–safe).
 * Avoids Skia’s Canvas path, which hard-requires Reanimated at runtime and was
 * crashing with “[runtime not ready]: react-native-reanimated is not installed!”.
 */
export function ShiftsProgressRing({
  progress,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  color = BRAND_COLOR,
  children,
}: ShiftsProgressRingProps) {
  const target = clamp01(progress);
  const [displayProgress, setDisplayProgress] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    let frame = 0;
    const start = displayRef.current;
    const delta = target - start;
    if (delta === 0) {
      return;
    }
    const startedAt = Date.now();

    const tick = () => {
      const t = Math.min(1, (Date.now() - startedAt) / ANIM_MS);
      const eased = 1 - (1 - t) ** 3;
      const next = start + delta * eased;
      displayRef.current = next;
      setDisplayProgress(next);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [target]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - displayProgress);

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.18}
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children != null ? (
        <View className="absolute inset-0 items-center justify-center px-8">
          {children}
        </View>
      ) : null}
    </View>
  );
}
