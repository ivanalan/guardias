import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { LayoutAnimation, ScrollView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { parseISO } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { BRAND_COLOR, BRAND_SELECTION } from '../../../theme/brand';
import { Pressable, Text, TextInput, View } from '../../../tw';
import { RotationPreviewCalendar } from '../components/rotation-preview-calendar';
import {
  defaultRotationEndISO,
  formatFormDate,
  parseHHMM,
  toHHMM,
  toISODate,
} from '../format-period-range';
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
  'start' | 'end' | 'shiftStart' | 'vacationStart' | 'vacationEnd' | null;

/** Pickers low on the form — scroll them into view when opened. */
const BOTTOM_PICKERS: ReadonlySet<Exclude<ActivePicker, null>> = new Set([
  'shiftStart',
  'vacationStart',
  'vacationEnd',
]);

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
      shiftStartTime: DEFAULT_SHIFT_START_TIME,
      vacationEnabled: false,
      vacationStartDate: start,
      vacationEndDate: end,
    };
  }

  return {
    label: existing.label,
    startDate: existing.startDate,
    endDate: existing.endDate,
    cycleDays: existing.pattern.cycleDays,
    offset: existing.pattern.offset,
    shiftStartTime: existing.shiftStartTime,
    vacationEnabled:
      existing.vacationStartDate != null && existing.vacationEndDate != null,
    vacationStartDate: existing.vacationStartDate ?? existing.startDate,
    vacationEndDate: existing.vacationEndDate ?? existing.endDate,
  };
}

function isLabelError(error: RotationValidationError | null): boolean {
  return error === 'labelRequired';
}

function isPeriodError(error: RotationValidationError | null): boolean {
  return error === 'dateOrder' || error === 'dateOverlap';
}

function isVacationError(error: RotationValidationError | null): boolean {
  return error === 'vacationOrder' || error === 'vacationOutOfBounds';
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

  const initial = initialFormState(existing);
  const [label, setLabel] = useState(initial.label);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [cycleDays, setCycleDays] = useState<CycleDays>(initial.cycleDays);
  const [offset, setOffset] = useState<OffsetLetter>(initial.offset);
  const [shiftStartTime, setShiftStartTime] = useState(initial.shiftStartTime);
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
  const [error, setError] = useState<RotationValidationError | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevActivePickerRef = useRef<ActivePicker>(null);
  const startAtPickerOpenRef = useRef<string | null>(null);

  const offsets = OFFSETS_FOR_CYCLE[cycleDays];
  const shouldScrollPickerIntoView =
    activePicker != null && BOTTOM_PICKERS.has(activePicker);

  const draftPeriod: RotationPeriod = {
    id: editingId ?? 'draft',
    label: label.trim() || 'draft',
    startDate,
    endDate,
    pattern: { cycleDays, offset },
    vacationStartDate: vacationEnabled ? vacationStartDate : null,
    vacationEndDate: vacationEnabled ? vacationEndDate : null,
    shiftStartTime,
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

  // When the start picker closes after a real start change, fill end if untouched.
  useEffect(() => {
    const prev = prevActivePickerRef.current;
    prevActivePickerRef.current = activePicker;

    if (activePicker === 'start' && prev !== 'start') {
      startAtPickerOpenRef.current = startDate;
      return;
    }

    if (prev !== 'start' || activePicker === 'start') {
      return;
    }

    if (
      !endDateTouched &&
      startAtPickerOpenRef.current != null &&
      startDate !== startAtPickerOpenRef.current
    ) {
      setEndDate(defaultRotationEndISO(parseISO(startDate)));
    }
    startAtPickerOpenRef.current = null;
  }, [activePicker, startDate, endDateTouched]);

  function selectCycleDays(next: CycleDays) {
    setCycleDays(next);
    setOffset((prev) => (OFFSETS_FOR_CYCLE[next].includes(prev) ? prev : 'A'));
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
    setVacationEndDate((prevEnd) => (next > prevEnd ? next : prevEnd));
    setError(null);
  }

  function onVacationEndValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    setVacationEndDate(toISODate(selected));
    setError(null);
  }

  function onVacationToggle(enabled: boolean) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVacationEnabled(enabled);
    if (enabled) {
      setVacationStartDate(startDate);
      setVacationEndDate(endDate);
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
        vacationStartDate: vacationStart,
        vacationEndDate: vacationEnd,
        shiftStartTime,
      });
    } else {
      addPeriod({
        id: Crypto.randomUUID(),
        label: label.trim(),
        startDate,
        endDate,
        pattern: { cycleDays, offset },
        vacationStartDate: vacationStart,
        vacationEndDate: vacationEnd,
        shiftStartTime,
        createdAt: new Date().toISOString(),
      });
    }
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
    shiftStartTime,
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
          <View className="flex-row items-center justify-between gap-3 px-4 py-3">
            <Text className="flex-shrink text-base text-neutral-900">
              {t('shifts.form.offset')}
            </Text>
            <View className="flex-row gap-2">
              {offsets.map((letter) => {
                const selected = offset === letter;
                return (
                  <Pressable
                    key={letter}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={letter}
                    onPress={() => setOffset(letter)}
                    className={`min-w-14 items-center rounded-xl border px-2 py-2 active:opacity-70 ${
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
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-base text-neutral-900">
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
      className="flex-row items-center justify-between gap-3 px-4 py-3.5 active:opacity-70"
      style={
        selected
          ? { backgroundColor: BRAND_SELECTION.backgroundSubtle }
          : undefined
      }
    >
      <Text className="flex-shrink text-base text-neutral-900">{label}</Text>
      <View className="min-w-0 flex-row items-center gap-1">
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
