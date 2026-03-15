import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import type { PostFormData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { createPost } from '../../lib/postService';
import CreateStepBasic from '../../components/post/CreateStepBasic';
import CreateStepDetails from '../../components/post/CreateStepDetails';
import CreateStepConfirm from '../../components/post/CreateStepConfirm';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const INITIAL_FORM: PostFormData = {
  category: 'stock',
  title: '',
  content: '',
  images: [],
  allowComments: true,
  price: '',
  stockStatus: '在庫あり',
  stockDuration: '48hours',
  eventDate: '',
  eventTime: '',
  fee: '',
  maxParticipants: undefined,
  helpType: 'request',
  reward: '',
  estimatedTime: '',
  deadline: '',
  requirements: [],
};

type CalendarTarget = 'eventDate' | 'deadline' | null;

/* ─── Step Indicator ─── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.container}>
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const completed = stepNum < current;
        const active = stepNum === current;
        return (
          <React.Fragment key={stepNum}>
            {i > 0 && (
              <View
                style={[
                  stepStyles.line,
                  completed && stepStyles.lineCompleted,
                ]}
              />
            )}
            <View
              style={[
                stepStyles.dot,
                completed && stepStyles.dotCompleted,
                active && stepStyles.dotActive,
              ]}
            >
              {completed ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : (
                <Text
                  style={[
                    stepStyles.dotText,
                    active && stepStyles.dotTextActive,
                  ]}
                >
                  {stepNum}
                </Text>
              )}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
    gap: 0,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  dotActive: {
    borderColor: Colors.primary,
    backgroundColor: '#fff',
  },
  dotCompleted: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dotText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  dotTextActive: {
    color: Colors.primary,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
});

/* ─── Time Picker Modal ─── */
function TimePickerModal({
  visible,
  hour,
  minute,
  onChangeHour,
  onChangeMinute,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  hour: number;
  minute: number;
  onChangeHour: (h: number) => void;
  onChangeMinute: (m: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>時刻を選択</Text>

          <View style={styles.timePickerColumns}>
            {/* Hour column */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>時</Text>
              <ScrollView
                ref={hourRef}
                style={styles.timeScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.timeScrollContent}
              >
                {HOURS.map((h) => {
                  const active = h === hour;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeCell, active && styles.timeCellActive]}
                      onPress={() => onChangeHour(h)}
                    >
                      <Text style={[styles.timeCellText, active && styles.timeCellTextActive]}>
                        {String(h).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={styles.timeColon}>:</Text>

            {/* Minute column */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>分</Text>
              <ScrollView
                ref={minuteRef}
                style={styles.timeScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.timeScrollContent}
              >
                {MINUTES.map((m) => {
                  const active = m === minute;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.timeCell, active && styles.timeCellActive]}
                      onPress={() => onChangeMinute(m)}
                    >
                      <Text style={[styles.timeCellText, active && styles.timeCellTextActive]}>
                        {String(m).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <Text style={styles.timePreview}>
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
          </Text>

          <View style={styles.timeActions}>
            <TouchableOpacity style={styles.timeActionCancel} onPress={onClose}>
              <Text style={styles.timeActionCancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeActionConfirm} onPress={onConfirm}>
              <Text style={styles.timeActionConfirmText}>決定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ─── Main Screen ─── */
export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const { coords, error: locationError } = useLocation();

  // セッション確認完了後に未ログインならログインへ
  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login');
  }, [authLoading, user, router]);

  const [form, setForm] = useState<PostFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerHour, setPickerHour] = useState(18);
  const [pickerMinute, setPickerMinute] = useState(0);

  /* Step state */
  const [step, setStep] = useState(1);

  /* Manual location fallback */
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualPlace, setManualPlace] = useState({ name: '', address: '' });

  const set = (patch: Partial<PostFormData>) => setForm((prev) => ({ ...prev, ...patch }));

  const locationHint = useMemo(() => {
    if (manualPlace.name.trim()) return manualPlace.name;
    if (locationError) return locationError;
    if (form.place?.address) return form.place.address;
    if (coords) return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
    return '現在地を取得できません。位置情報設定をご確認ください。';
  }, [coords, form.place, locationError, manualPlace.name]);

  const openCalendar = (target: Exclude<CalendarTarget, null>) => {
    const currentValue = target === 'eventDate' ? form.eventDate : form.deadline;
    const baseDate = currentValue ? parseDate(currentValue) : new Date();
    setCalendarMonth(baseDate ?? new Date());
    setCalendarTarget(target);
  };

  const openTimePicker = () => {
    if (form.eventTime) {
      const parts = form.eventTime.split(':');
      if (parts.length === 2) {
        setPickerHour(parseInt(parts[0], 10) || 18);
        setPickerMinute(parseInt(parts[1], 10) || 0);
      }
    }
    setTimePickerVisible(true);
  };

  const confirmTime = () => {
    const formatted = `${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`;
    set({ eventTime: formatted });
    setTimePickerVisible(false);
  };

  const handlePickImage = async () => {
    if (form.images.length >= 4) {
      Alert.alert('画像は最大4枚までです');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('画像アクセス権限が必要です', '端末の設定から写真へのアクセスを許可してください。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    set({ images: [...form.images, result.assets[0].uri] });
  };

  const removeImage = (uri: string) => {
    set({ images: form.images.filter((item) => item !== uri) });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert('入力エラー', 'タイトルを入力してください。');
      return;
    }

    if (!user) {
      Alert.alert('ログインが必要です', '投稿するにはログインしてください。');
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      // If manual place is provided, attach it to the form
      const formToSubmit = { ...form };
      if (manualPlace.name.trim() || manualPlace.address.trim()) {
        formToSubmit.place = {
          name: manualPlace.name.trim(),
          address: manualPlace.address.trim(),
          latitude: coords?.latitude ?? 0,
          longitude: coords?.longitude ?? 0,
        };
      }

      const postId = await createPost({
        form: formToSubmit,
        userId: user.id,
        coords: coords ? { latitude: coords.latitude, longitude: coords.longitude } : null,
      });

      setForm(INITIAL_FORM);
      setStep(1);
      setManualPlace({ name: '', address: '' });
      setShowManualLocation(false);
      router.replace({
        pathname: '/post/success',
        params: {
          id: postId,
          title: form.title.trim(),
          category: form.category,
        },
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '投稿に失敗しました。';
      Alert.alert('投稿失敗', message);
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 1) {
      if (!form.title.trim()) {
        Alert.alert('入力エラー', 'タイトルを入力してください。');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const monthLabel = `${calendarMonth.getFullYear()}年 ${calendarMonth.getMonth() + 1}月`;
  const days = calendarTarget ? getCalendarDays(calendarMonth) : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => {
          if (step > 1) {
            goBack();
          } else {
            router.back();
          }
        }}>
          <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ステップ {step}/3</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Step Indicator */}
      <StepIndicator current={step} total={3} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ──── Step 1: Basic Info ──── */}
        {step === 1 && <CreateStepBasic form={form} set={set} onPickImage={handlePickImage} onRemoveImage={removeImage} />}

        {/* ──── Step 2: Details ──── */}
        {step === 2 && <CreateStepDetails form={form} set={set} onOpenCalendar={openCalendar} onOpenTimePicker={openTimePicker} />}

        {/* ──── Step 3: Location & Confirm ──── */}
        {step === 3 && <CreateStepConfirm form={form} locationHint={locationHint} showManualLocation={showManualLocation} manualPlace={manualPlace} onToggleManualLocation={setShowManualLocation} onManualPlaceChange={setManualPlace} />}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom navigation buttons */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={18} color={Colors.textSecondary} />
            <Text style={styles.backBtnText}>戻る</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextBtn, step === 1 && { flex: 1 }]}
            onPress={goNext}
          >
            <Text style={styles.nextBtnText}>次へ</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, styles.submitBtnBottom, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="paper-plane-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.nextBtnText}>{submitting ? '投稿中...' : '投稿する'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Calendar Modal */}
      <Modal visible={calendarTarget !== null} transparent animationType="fade" onRequestClose={() => setCalendarTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCalendarMonth(addMonths(calendarMonth, -1))}>
                <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{monthLabel}</Text>
              <TouchableOpacity onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                <Ionicons name="chevron-forward" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {['日', '月', '火', '水', '木', '金', '土'].map((w) => (
                <Text key={w} style={styles.weekText}>{w}</Text>
              ))}
            </View>

            <View style={styles.daysWrap}>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={`${day?.toISOString() ?? 'blank'}-${index}`}
                  style={[styles.dayBtn, !day && styles.dayBtnEmpty]}
                  disabled={!day}
                  onPress={() => {
                    if (!day || !calendarTarget) return;
                    const value = formatYmd(day);
                    if (calendarTarget === 'eventDate') set({ eventDate: value });
                    if (calendarTarget === 'deadline') set({ deadline: value });
                    setCalendarTarget(null);
                  }}
                >
                  <Text style={[styles.dayText, !day && styles.dayTextEmpty]}>{day ? day.getDate() : ''}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.calendarClose} onPress={() => setCalendarTarget(null)}>
              <Text style={styles.calendarCloseText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        hour={pickerHour}
        minute={pickerMinute}
        onChangeHour={setPickerHour}
        onChangeMinute={setPickerMinute}
        onConfirm={confirmTime}
        onClose={() => setTimePickerVisible(false)}
      />
    </View>
  );
}

/* ─── Helpers ─── */

function formatYmd(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addMonths(base: Date, diff: number) {
  return new Date(base.getFullYear(), base.getMonth() + diff, 1);
}

function getCalendarDays(baseMonth: Date): Array<Date | null> {
  const firstDay = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);
  const lastDay = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 0);
  const startOffset = firstDay.getDay();
  const total = startOffset + lastDay.getDate();
  const rowSize = Math.ceil(total / 7) * 7;

  return Array.from({ length: rowSize }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
    return new Date(baseMonth.getFullYear(), baseMonth.getMonth(), dayNum);
  });
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  submitBtnDisabled: { opacity: 0.5 },

  /* Scroll area */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* Bottom bar */
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  submitBtnBottom: {
    backgroundColor: Colors.primary,
  },

  /* Modal shared */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },

  /* Calendar */
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekText: {
    width: 36,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 4,
  },
  dayBtn: {
    width: 40,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
  },
  dayBtnEmpty: {
    backgroundColor: 'transparent',
  },
  dayText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayTextEmpty: {
    color: 'transparent',
  },
  calendarClose: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  calendarCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  /* Time picker */
  timePickerColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeColumn: {
    alignItems: 'center',
    width: 80,
  },
  timeColumnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  timeScroll: {
    height: 200,
  },
  timeScrollContent: {
    paddingVertical: 4,
  },
  timeCell: {
    width: 64,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    backgroundColor: Colors.surfaceSecondary,
  },
  timeCellActive: {
    backgroundColor: Colors.primary,
  },
  timeCellText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timeCellTextActive: {
    color: '#fff',
  },
  timeColon: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
  },
  timePreview: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  timeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  timeActionCancel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  timeActionCancelText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 15,
  },
  timeActionConfirm: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  timeActionConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
