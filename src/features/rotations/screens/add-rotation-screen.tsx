import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert, ScrollView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { parseISO } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { getDefaultFirstShiftDate } from '../../../lib/shifts';
import { ANDROID_TEXT_WIDTH_BUMP } from '../../../theme/android-text';
import { brandSelection } from '../../../theme/colors';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, TextInput, View } from '../../../tw';
import { RotationColorSwatches } from '../components/rotation-color-swatches';
import { RotationPreviewCalendar } from '../components/rotation-preview-calendar';
import {
  defaultRotationEndISO,
  defaultVacationEndWithinPeriod,
  formatFormDate,
  formatFormTime,
  parseHHMM,
  toHHMM,
  toISODate,
} from '../format-period-range';
import { DEFAULT_ROTATION_COLOR } from '../rotation-colors';
import { useRotations } from '../rotations-context';
import type { ShiftsStackParamList } from '../shifts-stack';
import {
  DEFAULT_PATTERN,
  DEFAULT_SHIFT_START_TIME,
  OFFSETS_FOR_CYCLE,
  type CycleDays,
  type OffsetLetter,
  type RotationPeriod,
} from '../types';
import {
  validatePeriodForm,
  type RotationValidationError,
} from '../validate-new-period';

type Props = NativeStackScreenProps<
  ShiftsStackParamList,
  'AddRotation' | 'EditRotation'
>;

/**
 * Leave the add/edit form without leaving a zombie AddRotation on the Shifts
 * tab. Cross-tab open from Home mounts AddRotation as the stack's only route;
 * plain goBack() then returns to Home without popping the form.
 */
function dismissRotationForm(navigation: Props['navigation']) {
  if (navigation.getState().routes.length > 1) {
    navigation.goBack();
    return;
  }
  const parent = navigation.getParent();
  navigation.reset({
    index: 0,
    routes: [{ name: 'ShiftsList' }],
  });
  parent?.navigate('Home');
}

type ActivePicker =
  | 'start'
  | 'end'
  | 'firstShift'
  | 'shiftStart'
  | 'vacationStart'
  | 'vacationEnd'
  | null;

const FIELD_BOX_CLASS =
  'h-14 flex-row items-center rounded-xl border border-neutral-200 px-4';

function initialFormState(existing: RotationPeriod | undefined) {
  if (existing == null) {
    const start = toISODate(new Date());
    const end = defaultRotationEndISO(parseISO(start));
    return {
      label: '',
      startDate: start,
      endDate: end,
      cycleDays: DEFAULT_PATTERN.cycleDays,
      offset: DEFAULT_PATTERN.offset,
      firstShiftOverride: null as string | null,
      shiftStartTime: DEFAULT_SHIFT_START_TIME,
      color: DEFAULT_ROTATION_COLOR,
      vacationEnabled: false,
      vacationStartDate: start,
      vacationEndDate: defaultVacationEndWithinPeriod(start, end),
    };
  }

  const vacationStart = existing.vacationStartDate ?? existing.startDate;
  return {
    label: existing.label,
    startDate: existing.startDate,
    endDate: existing.endDate,
    cycleDays: existing.pattern.cycleDays,
    offset: existing.pattern.offset,
    firstShiftOverride: existing.firstShiftDate,
    shiftStartTime: existing.shiftStartTime,
    color: existing.color,
    vacationEnabled:
      existing.vacationStartDate != null && existing.vacationEndDate != null,
    vacationStartDate: vacationStart,
    vacationEndDate:
      existing.vacationEndDate ??
      defaultVacationEndWithinPeriod(vacationStart, existing.endDate),
  };
}

function isLabelError(error: RotationValidationError | null): boolean {
  return error === 'labelRequired';
}

function isPeriodError(error: RotationValidationError | null): boolean {
  return error === 'dateOrder' || error === 'dateOverlap';
}

function isScheduleError(error: RotationValidationError | null): boolean {
  return error === 'firstShiftOutOfBounds';
}

function isVacationError(error: RotationValidationError | null): boolean {
  return error === 'vacationOrder' || error === 'vacationOutOfBounds';
}

/** Persist null when the visible first shift matches the Jan 1 default. */
function firstShiftDateForSave(
  override: string | null,
  defaultFirstShift: string | null,
): string | null {
  if (override == null || override === defaultFirstShift) {
    return null;
  }
  return override;
}

type FormSnapshot = ReturnType<typeof initialFormState>;

function isFormDirty(snapshot: FormSnapshot, current: FormSnapshot): boolean {
  return (
    snapshot.label !== current.label ||
    snapshot.startDate !== current.startDate ||
    snapshot.endDate !== current.endDate ||
    snapshot.cycleDays !== current.cycleDays ||
    snapshot.offset !== current.offset ||
    snapshot.firstShiftOverride !== current.firstShiftOverride ||
    snapshot.shiftStartTime !== current.shiftStartTime ||
    snapshot.color !== current.color ||
    snapshot.vacationEnabled !== current.vacationEnabled ||
    snapshot.vacationStartDate !== current.vacationStartDate ||
    snapshot.vacationEndDate !== current.vacationEndDate
  );
}

/** Add or edit rotation form (F1 / F4). */
export function AddRotationScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods, addPeriod, updatePeriod } = useRotations();

  const routeParams = route.params;
  const editingId =
    route.name === 'EditRotation' && routeParams
      ? routeParams.periodId
      : undefined;
  const existing =
    editingId != null
      ? periods.find((item) => item.id === editingId)
      : undefined;

  const initialSnapshotRef = useRef<FormSnapshot | null>(null);
  if (initialSnapshotRef.current == null) {
    initialSnapshotRef.current = initialFormState(existing);
  }
  const initial = initialSnapshotRef.current;
  const [label, setLabel] = useState(initial.label);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [cycleDays, setCycleDays] = useState<CycleDays>(initial.cycleDays);
  const [offset, setOffset] = useState<OffsetLetter>(initial.offset);
  const [firstShiftOverride, setFirstShiftOverride] = useState<string | null>(
    initial.firstShiftOverride,
  );
  const [shiftStartTime, setShiftStartTime] = useState(initial.shiftStartTime);
  const [color, setColor] = useState(initial.color);
  const [vacationEnabled, setVacationEnabled] = useState(
    initial.vacationEnabled,
  );
  const [vacationStartDate, setVacationStartDate] = useState(
    initial.vacationStartDate,
  );
  const [vacationEndDate, setVacationEndDate] = useState(
    initial.vacationEndDate,
  );
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [endDateTouched, setEndDateTouched] = useState(false);
  const [vacationEndTouched, setVacationEndTouched] = useState(
    () =>
      existing?.vacationStartDate != null && existing.vacationEndDate != null,
  );
  const [error, setError] = useState<RotationValidationError | null>(null);
  const prevActivePickerRef = useRef<ActivePicker>(null);
  const startAtPickerOpenRef = useRef<string | null>(null);
  const vacationStartAtPickerOpenRef = useRef<string | null>(null);
  const [leaveConfirmed, setLeaveConfirmed] = useState(false);

  const isDirty = isFormDirty(initial, {
    label,
    startDate,
    endDate,
    cycleDays,
    offset,
    firstShiftOverride,
    shiftStartTime,
    color,
    vacationEnabled,
    vacationStartDate,
    vacationEndDate,
  });
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const offsets = OFFSETS_FOR_CYCLE[cycleDays];

  const defaultFirstShift = getDefaultFirstShiftDate(startDate, endDate, {
    cycleDays,
    offset,
  });
  const displayedFirstShift =
    firstShiftOverride ?? defaultFirstShift ?? startDate;
  const persistedFirstShift = firstShiftDateForSave(
    firstShiftOverride,
    defaultFirstShift,
  );

  const draftPeriod: RotationPeriod = {
    id: editingId ?? 'draft',
    label: label.trim() || 'draft',
    startDate,
    endDate,
    pattern: { cycleDays, offset },
    firstShiftDate: persistedFirstShift,
    vacationStartDate: vacationEnabled ? vacationStartDate : null,
    vacationEndDate: vacationEnabled ? vacationEndDate : null,
    shiftStartTime,
    color,
    createdAt: existing?.createdAt ?? '1970-01-01T00:00:00.000Z',
  };

  const isRootOfStack = navigation.getState().routes.length === 1;
  const shouldPreventRemove = !leaveConfirmed && (isDirty || isRootOfStack);

  usePreventRemove(shouldPreventRemove, ({ data }) => {
    if (isDirtyRef.current) {
      Alert.alert(t('shifts.discardTitle'), t('shifts.discardBody'), [
        { text: t('shifts.keepEditing'), style: 'cancel' },
        {
          text: t('shifts.discardConfirm'),
          style: 'destructive',
          onPress: () => {
            if (navigation.getState().routes.length === 1) {
              setLeaveConfirmed(true);
              return;
            }
            navigation.dispatch(data.action);
          },
        },
      ]);
      return;
    }

    // Clean leave from a one-screen stack: rewrite goBack so it resets the
    // Shifts stack instead of bubbling to the Home tab with the form intact.
    setLeaveConfirmed(true);
  });

  useEffect(() => {
    if (!leaveConfirmed) {
      return;
    }
    dismissRotationForm(navigation);
  }, [leaveConfirmed, navigation]);

  // When start / vacation-start pickers close after a real change, fill end if untouched.
  useEffect(() => {
    const prev = prevActivePickerRef.current;
    prevActivePickerRef.current = activePicker;

    if (activePicker === 'start' && prev !== 'start') {
      startAtPickerOpenRef.current = startDate;
    } else if (prev === 'start' && activePicker !== 'start') {
      if (
        !endDateTouched &&
        startAtPickerOpenRef.current != null &&
        startDate !== startAtPickerOpenRef.current
      ) {
        setEndDate(defaultRotationEndISO(parseISO(startDate)));
      }
      startAtPickerOpenRef.current = null;
    }

    if (activePicker === 'vacationStart' && prev !== 'vacationStart') {
      vacationStartAtPickerOpenRef.current = vacationStartDate;
    } else if (prev === 'vacationStart' && activePicker !== 'vacationStart') {
      if (
        !vacationEndTouched &&
        vacationStartAtPickerOpenRef.current != null &&
        vacationStartDate !== vacationStartAtPickerOpenRef.current
      ) {
        setVacationEndDate(
          defaultVacationEndWithinPeriod(vacationStartDate, endDate),
        );
      }
      vacationStartAtPickerOpenRef.current = null;
    }
  }, [
    activePicker,
    startDate,
    endDate,
    endDateTouched,
    vacationStartDate,
    vacationEndTouched,
  ]);

  function selectCycleDays(next: CycleDays) {
    setCycleDays(next);
    setOffset((prev) => (OFFSETS_FOR_CYCLE[next].includes(prev) ? prev : 'A'));
  }

  function selectOffset(letter: OffsetLetter) {
    setOffset(letter);
    setError(null);
  }

  function togglePicker(field: Exclude<ActivePicker, null>) {
    setActivePicker((prev) => (prev === field ? null : field));
  }

  function dismissPicker() {
    setActivePicker(null);
  }

  function onStartDateValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    const nextStart = toISODate(selected);
    setStartDate(nextStart);
    if (endDateTouched) {
      setEndDate((prevEnd) => (nextStart > prevEnd ? nextStart : prevEnd));
    }
    setVacationStartDate((prev) => (prev < nextStart ? nextStart : prev));
    setError(null);
  }

  function onEndDateValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    const nextEnd = toISODate(selected);
    setEndDateTouched(true);
    setEndDate(nextEnd);
    setVacationEndDate((prev) => (prev > nextEnd ? nextEnd : prev));
    setError(null);
  }

  function onFirstShiftValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    setFirstShiftOverride(toISODate(selected));
    setError(null);
  }

  function onShiftStartValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    setShiftStartTime(toHHMM(selected));
  }

  function onVacationStartValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    const next = toISODate(selected);
    setVacationStartDate(next);
    if (vacationEndTouched) {
      setVacationEndDate((prevEnd) => (next > prevEnd ? next : prevEnd));
    }
    setError(null);
  }

  function onVacationEndValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    setVacationEndTouched(true);
    setVacationEndDate(toISODate(selected));
    setError(null);
  }

  function onVacationToggle(enabled: boolean) {
    setVacationEnabled(enabled);
    if (enabled) {
      setVacationStartDate(startDate);
      setVacationEndDate(defaultVacationEndWithinPeriod(startDate, endDate));
      setVacationEndTouched(false);
    } else if (
      activePicker === 'vacationStart' ||
      activePicker === 'vacationEnd'
    ) {
      setActivePicker(null);
    }
    setError(null);
  }

  function save() {
    if (editingId != null && existing == null) {
      return;
    }

    const validationError = validatePeriodForm(
      {
        label,
        startDate,
        endDate,
        firstShiftDate: persistedFirstShift,
        vacationEnabled,
        vacationStartDate,
        vacationEndDate,
      },
      periods,
      editingId,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    const vacationStart = vacationEnabled ? vacationStartDate : null;
    const vacationEnd = vacationEnabled ? vacationEndDate : null;

    if (editingId != null && existing != null) {
      updatePeriod({
        ...existing,
        label: label.trim(),
        startDate,
        endDate,
        pattern: { cycleDays, offset },
        firstShiftDate: persistedFirstShift,
        vacationStartDate: vacationStart,
        vacationEndDate: vacationEnd,
        shiftStartTime,
        color,
      });
    } else {
      addPeriod({
        id: Crypto.randomUUID(),
        label: label.trim(),
        startDate,
        endDate,
        pattern: { cycleDays, offset },
        firstShiftDate: persistedFirstShift,
        vacationStartDate: vacationStart,
        vacationEndDate: vacationEnd,
        shiftStartTime,
        color,
        createdAt: new Date().toISOString(),
      });
    }
    setLeaveConfirmed(true);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shifts.save')}
          onPress={save}
          className="px-2 active:opacity-60"
          hitSlop={8}
        >
          <Ionicons name="save-outline" size={24} color={colors.brand} />
        </Pressable>
      ),
    });
  }, [
    navigation,
    label,
    startDate,
    endDate,
    cycleDays,
    offset,
    firstShiftOverride,
    shiftStartTime,
    color,
    vacationEnabled,
    vacationStartDate,
    vacationEndDate,
    t,
    colors.brand,
    addPeriod,
    updatePeriod,
    editingId,
    existing,
    periods,
  ]);

  if (editingId != null && existing == null) {
    return (
      <View
        className="flex-1 items-center justify-center gap-2 p-gutter"
        style={{ backgroundColor: colors.bg }}
      >
        <Text className="text-base" style={{ color: colors.text }}>
          {t('shifts.detail.notFound')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="w-full flex-col gap-5 px-gutter pt-4 pb-8">
        <View>
          <FieldLabel>{t('shifts.form.name')}</FieldLabel>
          <View
            className={FIELD_BOX_CLASS}
            style={{ borderCurve: 'continuous', backgroundColor: colors.bg1 }}
          >
            <TextInput
              value={label}
              onChangeText={(text) => {
                setLabel(text);
                setError(null);
              }}
              placeholder={t('shifts.form.namePlaceholder')}
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              accessibilityLabel={t('shifts.form.name')}
              className="flex-1 font-mono text-base"
              style={{ height: 24, padding: 0, color: colors.text }}
            />
          </View>
          {isLabelError(error) ? (
            <FieldError message={t(`shifts.errors.${error}`)} />
          ) : null}
        </View>

        <View>
          <View className="flex-row gap-3">
            <DateField
              label={t('shifts.form.startDate')}
              valueLabel={formatFormDate(startDate, language)}
              selected={activePicker === 'start'}
              onPress={() => togglePicker('start')}
              fill
            />
            <DateField
              label={t('shifts.form.endDate')}
              valueLabel={formatFormDate(endDate, language)}
              selected={activePicker === 'end'}
              onPress={() => togglePicker('end')}
              fill
            />
          </View>
          {activePicker === 'start' ? (
            <PickerSlot>
              <DateTimePicker
                value={parseISO(startDate)}
                mode="date"
                display={process.env.EXPO_OS === 'ios' ? 'inline' : 'default'}
                onValueChange={onStartDateValueChange}
                onDismiss={dismissPicker}
              />
            </PickerSlot>
          ) : null}
          {activePicker === 'end' ? (
            <PickerSlot>
              <DateTimePicker
                value={parseISO(endDate)}
                mode="date"
                display={process.env.EXPO_OS === 'ios' ? 'inline' : 'default'}
                minimumDate={parseISO(startDate)}
                onValueChange={onEndDateValueChange}
                onDismiss={dismissPicker}
              />
            </PickerSlot>
          ) : null}
          {isPeriodError(error) ? (
            <FieldError message={t(`shifts.errors.${error}`)} />
          ) : null}
        </View>

        <View>
          <FieldLabel>{t('shifts.form.schedule')}</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            <PatternPill
              label={t('shifts.form.patternAD')}
              selected={cycleDays === 4}
              onPress={() => selectCycleDays(4)}
            />
            <PatternPill
              label={t('shifts.form.patternAC')}
              selected={cycleDays === 3}
              onPress={() => selectCycleDays(3)}
            />
          </View>
        </View>

        <View>
          <FieldLabel>{t('shifts.form.offset')}</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            {offsets.map((letter) => (
              <LetterTile
                key={letter}
                letter={letter}
                selected={offset === letter}
                onPress={() => selectOffset(letter)}
              />
            ))}
          </View>
        </View>

        <View>
          <DateField
            label={t('shifts.form.firstShiftDate')}
            valueLabel={formatFormDate(displayedFirstShift, language)}
            selected={activePicker === 'firstShift'}
            onPress={() => togglePicker('firstShift')}
          />
          {activePicker === 'firstShift' ? (
            <PickerSlot>
              <DateTimePicker
                value={parseISO(displayedFirstShift)}
                mode="date"
                display={process.env.EXPO_OS === 'ios' ? 'inline' : 'default'}
                minimumDate={parseISO(startDate)}
                maximumDate={parseISO(endDate)}
                onValueChange={onFirstShiftValueChange}
                onDismiss={dismissPicker}
              />
            </PickerSlot>
          ) : null}
          {isScheduleError(error) ? (
            <FieldError message={t(`shifts.errors.${error}`)} />
          ) : null}
        </View>

        <View>
          <FieldLabel>{t('shifts.form.color')}</FieldLabel>
          <RotationColorSwatches value={color} onChange={setColor} />
        </View>

        <SectionRule label={t('shifts.form.sectionDetails')} />

        <View>
          <DateField
            label={t('shifts.form.shiftStartTime')}
            valueLabel={formatFormTime(shiftStartTime, language)}
            selected={activePicker === 'shiftStart'}
            onPress={() => togglePicker('shiftStart')}
            icon="time-outline"
          />
          {activePicker === 'shiftStart' ? (
            <PickerSlot>
              <DateTimePicker
                value={parseHHMM(shiftStartTime)}
                mode="time"
                display={process.env.EXPO_OS === 'ios' ? 'inline' : 'default'}
                onValueChange={onShiftStartValueChange}
                onDismiss={dismissPicker}
              />
            </PickerSlot>
          ) : null}
        </View>

        <View className="w-full flex-row items-center justify-between py-1">
          <Text
            className="font-mono text-sm"
            style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
          >
            {t('shifts.form.vacation')}
          </Text>
          <Switch
            value={vacationEnabled}
            onValueChange={onVacationToggle}
            trackColor={{ false: colors.switchTrackOff, true: colors.brand }}
            thumbColor={colors.bg1}
          />
        </View>
        {vacationEnabled ? (
          <View>
            <View className="flex-row gap-3">
              <DateField
                label={t('shifts.form.vacationStart')}
                valueLabel={formatFormDate(vacationStartDate, language)}
                selected={activePicker === 'vacationStart'}
                onPress={() => togglePicker('vacationStart')}
                fill
              />
              <DateField
                label={t('shifts.form.vacationEnd')}
                valueLabel={formatFormDate(vacationEndDate, language)}
                selected={activePicker === 'vacationEnd'}
                onPress={() => togglePicker('vacationEnd')}
                fill
              />
            </View>
            {activePicker === 'vacationStart' ? (
              <PickerSlot>
                <DateTimePicker
                  value={parseISO(vacationStartDate)}
                  mode="date"
                  display={process.env.EXPO_OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={parseISO(startDate)}
                  maximumDate={parseISO(endDate)}
                  onValueChange={onVacationStartValueChange}
                  onDismiss={dismissPicker}
                />
              </PickerSlot>
            ) : null}
            {activePicker === 'vacationEnd' ? (
              <PickerSlot>
                <DateTimePicker
                  value={parseISO(vacationEndDate)}
                  mode="date"
                  display={process.env.EXPO_OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={parseISO(vacationStartDate)}
                  maximumDate={parseISO(endDate)}
                  onValueChange={onVacationEndValueChange}
                  onDismiss={dismissPicker}
                />
              </PickerSlot>
            ) : null}
          </View>
        ) : null}
        {isVacationError(error) ? (
          <FieldError message={t(`shifts.errors.${error}`)} />
        ) : null}

        <SectionRule label={t('shifts.form.sectionPreview')} />

        <RotationPreviewCalendar period={draftPeriod} language={language} />
      </View>
    </ScrollView>
  );
}

function FieldLabel({ children }: { children: string }) {
  const { colors } = useTheme();

  return (
    <Text
      className="mb-1.5 font-mono text-sm"
      style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
    >
      {children}
    </Text>
  );
}

function DateField({
  label,
  valueLabel,
  selected,
  onPress,
  icon = 'calendar-outline',
  fill = false,
}: {
  label: string;
  valueLabel: string;
  selected: boolean;
  onPress: () => void;
  icon?: 'calendar-outline' | 'time-outline';
  fill?: boolean;
}) {
  const { colors } = useTheme();
  const selection = brandSelection(colors);

  return (
    <View className={fill ? 'min-w-0 flex-1' : 'w-full'}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${valueLabel}`}
        accessibilityState={{ selected }}
        onPress={onPress}
        className={`${FIELD_BOX_CLASS} active:opacity-70`}
        style={[
          { borderCurve: 'continuous' },
          {
            backgroundColor: selected
              ? selection.backgroundSubtle
              : colors.bg1,
          },
        ]}
      >
        <Text
          className="min-w-0 flex-1 font-mono text-base"
          numberOfLines={1}
          style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
        >
          {valueLabel}
        </Text>
        <Ionicons name={icon} size={18} color={colors.brand} />
      </Pressable>
    </View>
  );
}

function PatternPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded-xl px-3.5 py-2.5 active:opacity-80"
      style={[
        { borderCurve: 'continuous' },
        selected
          ? { backgroundColor: colors.brand }
          : {
              backgroundColor: colors.bg1,
              borderWidth: 1,
              borderColor: colors.border,
            },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark" size={16} color={colors.textInverse} />
      ) : null}
      <Text
        className="font-mono text-sm"
        style={{
          ...ANDROID_TEXT_WIDTH_BUMP,
          color: selected ? colors.textInverse : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LetterTile({
  letter,
  selected,
  onPress,
}: {
  letter: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={letter}
      onPress={onPress}
      className="h-12 min-w-18 flex-row items-center justify-center gap-2 rounded-xl px-3 active:opacity-80"
      style={[
        { borderCurve: 'continuous' },
        selected
          ? { backgroundColor: colors.brand }
          : {
              backgroundColor: colors.bg1,
              borderWidth: 1,
              borderColor: colors.border,
            },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark" size={16} color={colors.textInverse} />
      ) : null}
      <Text
        className="font-mono text-base"
        style={{ color: selected ? colors.textInverse : colors.textMuted }}
      >
        {letter}
      </Text>
    </Pressable>
  );
}

function SectionRule({ label }: { label: string }) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-3 py-1">
      <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
      <Text className="font-mono text-sm" style={{ color: colors.textMuted }}>
        {label}
      </Text>
      <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
    </View>
  );
}

function PickerSlot({ children }: { children: ReactNode }) {
  return <View className="items-center py-1">{children}</View>;
}

function FieldError({ message }: { message: string }) {
  return (
    <Text className="mt-1.5 font-mono text-sm text-red-600">{message}</Text>
  );
}
