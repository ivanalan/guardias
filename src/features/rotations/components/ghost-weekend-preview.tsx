import type { AppLanguage } from '../../../i18n';
import { WeekendBanner } from '../../dashboard/components/weekend-banner';
import { formatWeekendRange } from '../../dashboard/format-home-copy';
import { EMPTY_STATE_PREVIEW } from './empty-state-preview-data';

type GhostWeekendPreviewProps = {
  language: AppLanguage;
  caption: string;
};

/** Sample next-free-weekend banner for the empty-state preview. */
export function GhostWeekendPreview({
  language,
  caption,
}: GhostWeekendPreviewProps) {
  return (
    <WeekendBanner
      rangeLabel={formatWeekendRange(
        EMPTY_STATE_PREVIEW.freeWeekendDates[0],
        language,
      )}
      caption={caption}
    />
  );
}
