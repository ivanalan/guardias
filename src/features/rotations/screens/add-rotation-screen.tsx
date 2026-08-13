import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert, LayoutAnimation, ScrollView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { parseISO } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { getDefaultFirstShiftDate } from '../../../lib/shifts';
import { BRAND_COLOR, BRAND_SELECTION } from '../../../theme/brand';
import { Pressable, Text, TextInput, View } from '../../../tw';
import { RotationColorSwatches } from '../components/rotation-color-swatches';
import { RotationPreviewCalendar } from '../components/rotation-preview-calendar';
import {
  defaultRotationEndISO,
  defaultVacationEndWithinPeriod,
  formatFormDate,
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

type ActivePicker =
  | 'start'
  | 'end'
  | 'firstShift'
  | 'shiftStart'
  | 'vacationStart'
  | 'vacationEnd'
  | null;

/** Pickers low on the form — scroll them into view when opened. */
const BOTTOM_PICKERS: ReadonlySet<Exclude<ActivePicker, null>> = new Set([
  'firstShift',
  'shiftStart',
  'vacationStart',
  'vacationEnd',
]);

const FORM_ROW_CLASS = 'h-14 flex-row items-center gap-3 px-4';

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

  const vacationStart =
    existing.vacationStartDate ?? existing.startDate;
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
      existing?.vacationStartDate != null &&
      existing.vacationEndDate != null,
  );
  const [error, setError] = useState<RotationValidationError | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevActivePickerRef = useRef<ActivePicker>(null);
  const startAtPickerOpenRef = useRef<string | null>(null);
  const vacationStartAtPickerOpenRef = useRef<string | null>(null);
  const allowLeaveRef = useRef(false);

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
  const shouldScrollPickerIntoView =
    activePicker != null && BOTTOM_PICKERS.has(activePicker);

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

  useEffect(() => {
    if (!shouldScrollPickerIntoView) {
      return;
    }
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [shouldScrollPickerIntoView, activePicker]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current || !isDirtyRef.current) {
        return;
      }

      e.preventDefault();

      Alert.alert(t('shifts.discardTitle'), t('shifts.discardBody'), [
        { text: t('shifts.keepEditing'), style: 'cancel' },
        {
          text: t('shifts.discardConfirm'),
          style: 'destructive',
          onPress: () => {
            allowLeaveRef.current = true;
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });

    return unsubscribe;
  }, [navigation, t]);

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    allowLeaveRef.current = true;
    navigation.goBack();
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shifts.save')}
          onPress={save}
          className="px-2 active:opacity-60"
        >
          <Text
            className="text-base font-semibold"
            style={{ color: BRAND_COLOR }}
          >
            {t('shifts.save')}
          </Text>
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
    addPeriod,
    updatePeriod,
    editingId,
    existing,
    periods,
  ]);

  if (editingId != null && existing == null) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-neutral-50 p-6">
        <Text className="text-base">{t('shifts.detail.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-neutral-50"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingBottom: shouldScrollPickerIntoView ? 60 : 32,
      }}
    >
      <View className="gap-5 px-4 pt-4 pb-8">
        <FormSection title={t('shifts.form.sectionBasics')}>
          <View className="px-4 py-3">
            <TextInput
              value={label}
              onChangeText={(text) => {
                setLabel(text);
                setError(null);
              }}
              placeholder={t('shifts.form.namePlaceholder')}
              placeholderTextColor="#a3a3a3"
              returnKeyType="done"
              accessibilityLabel={t('shifts.form.name')}
              className="text-base text-neutral-900"
              style={{ height: 24, padding: 0 }}
            />
          </View>
          {isLabelError(error) ? (
            <FieldError message={t(`shifts.errors.${error}`)} />
          ) : null}
        </FormSection>

        <FormSection title={t('shifts.form.sectionPeriod')}>
          <FormRow
            label={t('shifts.form.startDate')}
            valueLabel={formatFormDate(startDate, language)}
            selected={activePicker === 'start'}
            onPress={() => togglePicker('start')}
          />
          {activePicker === 'start' ? (
            <PickerSlot>
              <DateTimePicker
                value={parseISO(startDate)}
                mode="date"
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={onStartDateValueChange}
                onDismiss={dismissPicker}
              />
            </PickerSlot>
          ) : null}
          <RowDivider />
          <FormRow
            label={t('shifts.form.endDate')}
            valueLabel={formatFormDate(endDate, language)}
            selected={activePicker === 'end'}
            onPress={() => togglePicker('end')}
          />
          {activePicker === 'end' ? (
            <PickerSlot>
              <DateTimePicker
                value={parseISO(endDate)}
                mode="date"
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={parseISO(startDate)}
                onValueChange={onEndDateValueChange}
                onDismiss={dismissPicker}
              />
            </PickerSlot>
          ) : null}
          {isPeriodError(error) ? (
            <FieldError message={t(`shifts.errors.${error}`)} />
          ) : null}
        </FormSection>

        <FormSection title={t('shifts.form.sectionSchedule')}>
          <ChoiceRow
            title={t('shifts.form.patternADTitle')}
            subtitle={t('shifts.form.patternADSubtitle')}
            accessibilityLabel={t('shifts.form.patternAD')}
            selected={cycleDays === 4}
            onPress={() => selectCycleDays(4)}
          />
          <RowDivider />
          <ChoiceRow
            title={t('shifts.form.patternACTitle')}
            subtitle={t('shifts.form.patternACSubtitle')}
            accessibilityLabel={t('shifts.form.patternAC')}
            selected={cycleDays === 3}
            onPress={() => selectCycleDays(3)}
          />
          <RowDivider />
          <View className="flex-row items-center gap-3 px-4 py-3">
            <Text className="shrink-0 text-base text-neutral-900">
              {t('shifts.form.offset')}
            </Text>
            <View className="min-w-0 flex-1 flex-row flex-wrap justify-end gap-2">
              {offsets.map((letter) => {
                const selected = offset === letter;
                return (
                  <Pressable
                    key={letter}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={letter}
                    onPress={() => selectOffset(letter)}
                    className={`min-w-12 items-center rounded-xl border px-2 py-2 active:opacity-70 ${
                      selected ? '' : 'border-neutral-200 bg-white'
                    }`}
                    style={[
                      { borderCurve: 'continuous' },
                      selected
                        ? {
                            backgroundColor: BRAND_SELECTION.background,
                            borderColor: BRAND_SELECTION.border,
                          }
                        : undefined,
                    ]}
                  >
                    <Text
                      className={`text-lg font-semibold ${
                        selected ? '' : 'text-neutral-800'
                      }`}
                      style={
                        selected
                          ? { color: BRAND_SELECTION.foreground }
                          : undefined
                      }
                    >
                      {letter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <RowDivider />
          <FormRow
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
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
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
        </FormSection>

        <FormSection title={t('shifts.form.color')}>
          <RotationColorSwatches value={color} onChange={setColor} />
        </FormSection>

        <FormSection title={t('shifts.form.sectionDetails')}>
          <FormRow
            label={t('shifts.form.shiftStartTime')}
            valueLabel={shiftStartTime}
            selected={activePicker === 'shiftStart'}
            onPress={() => togglePicker('shiftStart')}
          />
          {activePicker === 'shiftStart' ? (
            <PickerSlot>
              <DateTimePicker
                value={parseHHMM(shiftStartTime)}
                mode="time"
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={onShiftStartValueChange}
                onDismiss={dismissPicker}
              />
            </PickerSlot>
          ) : null}
          <RowDivider />
          <View className={FORM_ROW_CLASS}>
            <Text
              className="min-w-0 flex-1 text-base text-neutral-900"
              numberOfLines={1}
            >
              {t('shifts.form.vacation')}
            </Text>
            <Switch
              value={vacationEnabled}
              onValueChange={onVacationToggle}
              trackColor={{ false: '#d4d4d4', true: BRAND_COLOR }}
              thumbColor="#ffffff"
            />
          </View>
          {vacationEnabled ? (
            <>
              <RowDivider />
              <FormRow
                label={t('shifts.form.vacationStart')}
                valueLabel={formatFormDate(vacationStartDate, language)}
                selected={activePicker === 'vacationStart'}
                onPress={() => togglePicker('vacationStart')}
              />
              {activePicker === 'vacationStart' ? (
                <PickerSlot>
                  <DateTimePicker
                    value={parseISO(vacationStartDate)}
                    mode="date"
                    display={
                      process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'
                    }
                    minimumDate={parseISO(startDate)}
                    maximumDate={parseISO(endDate)}
                    onValueChange={onVacationStartValueChange}
                    onDismiss={dismissPicker}
                  />
                </PickerSlot>
              ) : null}
              <RowDivider />
              <FormRow
                label={t('shifts.form.vacationEnd')}
                valueLabel={formatFormDate(vacationEndDate, language)}
                selected={activePicker === 'vacationEnd'}
                onPress={() => togglePicker('vacationEnd')}
              />
              {activePicker === 'vacationEnd' ? (
                <PickerSlot>
                  <DateTimePicker
                    value={parseISO(vacationEndDate)}
                    mode="date"
                    display={
                      process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'
                    }
                    minimumDate={parseISO(vacationStartDate)}
                    maximumDate={parseISO(endDate)}
                    onValueChange={onVacationEndValueChange}
                    onDismiss={dismissPicker}
                  />
                </PickerSlot>
              ) : null}
            </>
          ) : null}
          {isVacationError(error) ? (
            <FieldError message={t(`shifts.errors.${error}`)} />
          ) : null}
        </FormSection>

        <View className="gap-2">
          <Text className="px-1 text-sm font-medium text-neutral-500">
            {t('shifts.form.sectionPreview')}
          </Text>
          <RotationPreviewCalendar period={draftPeriod} language={language} />
        </View>
      </View>
    </ScrollView>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-sm font-medium text-neutral-500">{title}</Text>
      <View
        className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white"
        style={{ borderCurve: 'continuous' }}
      >
        {children}
      </View>
    </View>
  );
}

function FormRow({
  label,
  valueLabel,
  selected,
  onPress,
}: {
  label: string;
  valueLabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${valueLabel}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`${FORM_ROW_CLASS} active:opacity-70`}
      style={
        selected
          ? { backgroundColor: BRAND_SELECTION.backgroundSubtle }
          : undefined
      }
    >
      <Text
        className="shrink-0 text-base text-neutral-900"
        numberOfLines={1}
      >
        {label}
      </Text>
      <View className="min-w-0 flex-1 flex-row items-center justify-end gap-1">
        <Text
          className="text-base"
          style={{
            color: selected ? BRAND_SELECTION.foreground : '#737373',
          }}
          numberOfLines={1}
        >
          {valueLabel}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={selected ? BRAND_SELECTION.foreground : '#a3a3a3'}
        />
      </View>
    </Pressable>
  );
}

function ChoiceRow({
  title,
  subtitle,
  accessibilityLabel,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  accessibilityLabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="flex-row items-center justify-between gap-3 px-4 py-3.5 active:opacity-70"
      style={
        selected ? { backgroundColor: BRAND_SELECTION.background } : undefined
      }
    >
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className={`text-base ${selected ? 'font-semibold' : 'text-neutral-900'}`}
          style={
            selected ? { color: BRAND_SELECTION.foreground } : undefined
          }
        >
          {title}
        </Text>
        <Text
          className={`text-sm ${selected ? '' : 'text-neutral-500'}`}
          style={
            selected ? { color: BRAND_SELECTION.foreground } : undefined
          }
        >
          {subtitle}
        </Text>
      </View>
      {selected ? (
        <Ionicons
          name="checkmark"
          size={20}
          color={BRAND_SELECTION.foreground}
        />
      ) : null}
    </Pressable>
  );
}

function RowDivider() {
  return <View className="ml-4 h-px bg-neutral-100" />;
}

function PickerSlot({ children }: { children: ReactNode }) {
  return (
    <View className="items-center border-t border-neutral-100 bg-neutral-50/80 py-1">
      {children}
    </View>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <View className="border-t border-red-100 px-4 py-2.5">
      <Text className="text-sm text-red-600">{message}</Text>
    </View>
  );
}
