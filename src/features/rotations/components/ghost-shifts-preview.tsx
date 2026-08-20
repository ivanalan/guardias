import { ShiftsLeftCard } from '../../dashboard/components/shifts-left-card';
import { EMPTY_STATE_PREVIEW } from './empty-state-preview-data';

type GhostShiftsPreviewProps = {
  caption: string;
};

/** Sample shifts-left card for the empty-state preview. */
export function GhostShiftsPreview({ caption }: GhostShiftsPreviewProps) {
  return (
    <ShiftsLeftCard
      remaining={EMPTY_STATE_PREVIEW.shiftsRemaining}
      total={EMPTY_STATE_PREVIEW.shiftsTotal}
      color={EMPTY_STATE_PREVIEW.shiftColor}
      caption={caption}
    />
  );
}
