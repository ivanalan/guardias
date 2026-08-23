import { useTheme } from '../../../theme/theme-context';
import { ShiftsLeftCard } from '../../dashboard/components/shifts-left-card';
import { resolveRotationColor } from '../rotation-colors';
import { EMPTY_STATE_PREVIEW } from './empty-state-preview-data';

type GhostShiftsPreviewProps = {
  caption: string;
};

/** Sample shifts-left card for the empty-state preview. */
export function GhostShiftsPreview({ caption }: GhostShiftsPreviewProps) {
  const { colors } = useTheme();

  return (
    <ShiftsLeftCard
      remaining={EMPTY_STATE_PREVIEW.shiftsRemaining}
      total={EMPTY_STATE_PREVIEW.shiftsTotal}
      color={resolveRotationColor(EMPTY_STATE_PREVIEW.shiftColor, colors)}
      caption={caption}
    />
  );
}
