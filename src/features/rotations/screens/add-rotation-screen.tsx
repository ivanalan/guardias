import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addMonths, parseISO } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { Pressable, Text, TextInput, View } from '../../../tw';
import {
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

function defaultEndISO(from: Date = new Date()): string {
  return toISODate(addMonths(from, 3));
}

function initialFormState(existing: RotationPeriod | undefined) {
  if (existing == null) {
    const start = toISODate(new Date());
    const end = defaultEndISO();
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
  const [error, setError] = useState<RotationValidationError | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const offsets = OFFSETS_FOR_CYCLE[cycleDays];
  const shouldScrollPickerIntoView =
    activePicker != null && BOTTOM_PICKERS.has(activePicker);

  useEffect(() => {
    if (!shouldScrollPickerIntoView) {
      return;
    }
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [shouldScrollPickerIntoView, activePicker]);

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
    setEndDate((prevEnd) => (nextStart > prevEnd ? nextStart : prevEnd));
    setVacationStartDate((prev) => (prev < nextStart ? nextStart : prev));
    setError(null);
  }

  function onEndDateValueChange(_event: unknown, selected: Date) {
    if (process.env.EXPO_OS === 'android') {
      setActivePicker(null);
    }
    const nextEnd = toISODate(selected);
    setEndDate(nextEnd);
    setVacationEndDate((prev) => (prev > nextEnd ? nextEnd : prev));
    setError(null);
  }
  [
    {
      resource:
        '/Users/amatias/personal-projects/guardias/src/features/rotations/screens/rotation-detail-screen.tsx',
      owner: 'typescript',
      code: '18048',
      severity: 8,
      message: "'period' is possibly 'undefined'.",
      source: 'ts',
      startLineNumber: 49,
      startColumn: 53,
      endLineNumber: 49,
      endColumn: 59,
      modelVersionId: 3,
    },
    {
      resource:
        '/Users/amatias/personal-projects/guardias/src/features/rotations/screens/rotation-detail-screen.tsx',
      owner: 'typescript',
      code: '18048',
      severity: 8,
      message: "'period' is possibly 'undefined'.",
      source: 'ts',
      startLineNumber: 56,
      startColumn: 26,
      endLineNumber: 56,
      endColumn: 32,
      modelVersionId: 3,
    },
  ];

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
    setVacationEnabled(enabled);
    if (enabled) {
      setVacationStartDate(startDate);
      setVacationEndDate(endDate);
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
          <Text className="text-base font-semibold">{t('shifts.save')}</Text>
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
      <View className="flex-1 items-center justify-center gap-2 bg-white p-6">
        <Text className="text-base">{t('shifts.detail.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingBottom: shouldScrollPickerIntoView ? 60 : 32,
      }}
    >
      <View className="gap-6 px-4 pt-4 pb-8">
        {error ? (
          <Text className="text-sm text-red-600">
            {t(`shifts.errors.${error}`)}
          </Text>
        ) : null}

        <View className="gap-2">
          <Text className="text-sm font-medium text-neutral-600">
            {t('shifts.form.name')}
          </Text>
          <TextInput
            value={label}
            onChangeText={(text) => {
              setLabel(text);
              setError(null);
            }}
            placeholder={t('shifts.form.namePlaceholder')}
            returnKeyType="done"
            accessibilityLabel={t('shifts.form.name')}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base"
            style={{ borderCurve: 'continuous' }}
          />
        </View>

        <View className="flex-row gap-3">
          <DateField
            label={t('shifts.form.startDate')}
            valueLabel={formatFormDate(startDate, language)}
            selected={activePicker === 'start'}
            onPress={() => togglePicker('start')}
          />
          <DateField
            label={t('shifts.form.endDate')}
            valueLabel={formatFormDate(endDate, language)}
            selected={activePicker === 'end'}
            onPress={() => togglePicker('end')}
          />
        </View>

        {activePicker === 'start' ? (
          <DateTimePicker
            value={parseISO(startDate)}
            mode="date"
            display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
            onValueChange={onStartDateValueChange}
            onDismiss={dismissPicker}
          />
        ) : null}

        {activePicker === 'end' ? (
          <DateTimePicker
            value={parseISO(endDate)}
            mode="date"
            display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={parseISO(startDate)}
            onValueChange={onEndDateValueChange}
            onDismiss={dismissPicker}
          />
        ) : null}

        <View className="gap-2">
          <Text className="text-sm font-medium text-neutral-600">
            {t('shifts.form.schedule')}
          </Text>
          <View className="gap-2">
            <PatternOption
              selected={cycleDays === 4}
              label={t('shifts.form.patternAD')}
              onPress={() => selectCycleDays(4)}
            />
            <PatternOption
              selected={cycleDays === 3}
              label={t('shifts.form.patternAC')}
              onPress={() => selectCycleDays(3)}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-neutral-600">
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
                  className={`flex-1 items-center rounded-xl border py-3 active:opacity-70 ${
                    selected
                      ? 'border-neutral-900 bg-white'
                      : 'border-neutral-200 bg-white'
                  }`}
                  style={{ borderCurve: 'continuous' }}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selected ? 'text-neutral-900' : 'text-neutral-800'
                    }`}
                  >
                    {letter}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-neutral-600">
            {t('shifts.form.shiftStartTime')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('shifts.form.shiftStartTime')}: ${shiftStartTime}`}
            accessibilityState={{ selected: activePicker === 'shiftStart' }}
            onPress={() => togglePicker('shiftStart')}
            className={`rounded-xl border px-4 py-3 active:opacity-70 ${
              activePicker === 'shiftStart'
                ? 'border-neutral-900 bg-white'
                : 'border-neutral-200 bg-white'
            }`}
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="text-base text-neutral-900">{shiftStartTime}</Text>
          </Pressable>
        </View>

        {activePicker === 'shiftStart' ? (
          <DateTimePicker
            value={parseHHMM(shiftStartTime)}
            mode="time"
            display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
            onValueChange={onShiftStartValueChange}
            onDismiss={dismissPicker}
          />
        ) : null}

        <View className="flex-row items-center justify-between py-1">
          <Text className="text-base text-neutral-900">
            {t('shifts.form.vacation')}
          </Text>
          <Switch
            value={vacationEnabled}
            onValueChange={onVacationToggle}
            trackColor={{ false: '#d4d4d4', true: '#404040' }}
            thumbColor="#ffffff"
          />
        </View>

        {vacationEnabled ? (
          <View className="gap-3">
            <View className="flex-row gap-3">
              <DateField
                label={t('shifts.form.vacationStart')}
                valueLabel={formatFormDate(vacationStartDate, language)}
                selected={activePicker === 'vacationStart'}
                onPress={() => togglePicker('vacationStart')}
              />
              <DateField
                label={t('shifts.form.vacationEnd')}
                valueLabel={formatFormDate(vacationEndDate, language)}
                selected={activePicker === 'vacationEnd'}
                onPress={() => togglePicker('vacationEnd')}
              />
            </View>

            {activePicker === 'vacationStart' ? (
              <DateTimePicker
                value={parseISO(vacationStartDate)}
                mode="date"
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={parseISO(startDate)}
                maximumDate={parseISO(endDate)}
                onValueChange={onVacationStartValueChange}
                onDismiss={dismissPicker}
              />
            ) : null}

            {activePicker === 'vacationEnd' ? (
              <DateTimePicker
                value={parseISO(vacationEndDate)}
                mode="date"
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={parseISO(vacationStartDate)}
                maximumDate={parseISO(endDate)}
                onValueChange={onVacationEndValueChange}
                onDismiss={dismissPicker}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function DateField({
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
    <View className="flex-1 gap-2">
      <Text className="text-sm font-medium text-neutral-600">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${valueLabel}`}
        accessibilityState={{ selected }}
        onPress={onPress}
        className={`rounded-xl border px-3 py-3 active:opacity-70 ${
          selected
            ? 'border-neutral-900 bg-white'
            : 'border-neutral-200 bg-white'
        }`}
        style={{ borderCurve: 'continuous' }}
      >
        <Text className="text-base text-neutral-900">{valueLabel}</Text>
      </Pressable>
    </View>
  );
}

function PatternOption({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className={`rounded-xl border px-4 py-3 active:opacity-70 ${
        selected ? 'border-neutral-900 bg-white' : 'border-neutral-200 bg-white'
      }`}
      style={{ borderCurve: 'continuous' }}
    >
      <Text
        className={`text-base ${selected ? 'font-semibold text-neutral-900' : 'text-neutral-800'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
