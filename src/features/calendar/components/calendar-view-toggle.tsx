import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useTranslation } from 'react-i18next';

import type { CalendarViewMode } from '../calendar-view-mode';

type Props = {
  value: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
};

const MODES: CalendarViewMode[] = ['month', 'scroll'];

/** Compact segmented control: single-month vs scrollable month list. */
export function CalendarViewToggle({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <SegmentedControl
      values={[t('calendar.viewMode.month'), t('calendar.viewMode.scroll')]}
      selectedIndex={value === 'month' ? 0 : 1}
      onChange={({ nativeEvent }) => {
        const mode = MODES[nativeEvent.selectedSegmentIndex];
        if (mode != null) {
          onChange(mode);
        }
      }}
      style={{ width: 168 }}
    />
  );
}
