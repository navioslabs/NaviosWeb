import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORIES, getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import type { PostFormData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { createPost } from '../../lib/postService';

const STOCK_DURATION_OPTIONS = [
  { value: 'today', label: '本日中' },
  { value: '48hours', label: '48時間' },
  { value: '3days', label: '3日間' },
  { value: '1week', label: '1週間' },
  { value: 'manual', label: '手動設定' },
] as const;

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
  const { user } = useAuth();
  const { coords, error: locationError } = useLocation();

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

  const category = getCategoryInfo(form.category);

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
        {step === 1 && (
          <>
            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>カテゴリ</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((item) => {
                  const active = item.id === form.category;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.categoryBtn,
                        active
                          ? { backgroundColor: item.color }
                          : { backgroundColor: item.bgColor, borderWidth: 1, borderColor: Colors.border },
                      ]}
                      onPress={() => set({ category: item.id })}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={getCategoryIconName(item.id) as keyof typeof Ionicons.glyphMap}
                        size={22}
                        color={active ? '#fff' : item.color}
                      />
                      <Text
                        style={[
                          styles.categoryBtnText,
                          active ? styles.categoryBtnTextActive : { color: item.color },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>タイトル <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(v) => set({ title: v })}
                placeholder="例: 野菜が安いお店を見つけました"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Content */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>詳細</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.content}
                onChangeText={(v) => set({ content: v })}
                placeholder="内容を具体的に書いてください"
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.divider} />

            {/* Images */}
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionLabel}>画像（最大4枚）</Text>
                <TouchableOpacity style={styles.imageAddBtn} onPress={handlePickImage}>
                  <Ionicons name="image-outline" size={16} color="#fff" />
                  <Text style={styles.imageAddText}>追加</Text>
                </TouchableOpacity>
              </View>
              {form.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
                  {form.images.map((uri) => (
                    <View key={uri} style={styles.previewWrap}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity style={styles.previewRemove} onPress={() => removeImage(uri)}>
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}

        {/* ──── Step 2: Details ──── */}
        {step === 2 && (
          <>
            {/* Category-specific fields */}
            <View style={styles.sectionGrouped}>
              <Text style={styles.sectionLabel}>{category.label}の詳細</Text>

              {form.category === 'stock' ? (
                <View style={styles.fieldsGap}>
                  <TextInput
                    style={styles.input}
                    value={form.price}
                    onChangeText={(v) => set({ price: v })}
                    placeholder="価格（例: 100円 / 1袋）"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <View style={styles.wrapRow}>
                    {STOCK_DURATION_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.chip, form.stockDuration === opt.value && styles.chipActive]}
                        onPress={() => set({ stockDuration: opt.value })}
                      >
                        <Text style={[styles.chipText, form.stockDuration === opt.value && styles.chipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              {form.category === 'event' ? (
                <View style={styles.fieldsGap}>
                  <TouchableOpacity style={styles.inputLike} onPress={() => openCalendar('eventDate')}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                    <Text style={[styles.inputLikeText, !form.eventDate && styles.inputLikePlaceholder]}>
                      {form.eventDate || '開催日を選択'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inputLike} onPress={openTimePicker}>
                    <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                    <Text style={[styles.inputLikeText, !form.eventTime && styles.inputLikePlaceholder]}>
                      {form.eventTime || '開催時刻を選択'}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    value={form.fee}
                    onChangeText={(v) => set({ fee: v })}
                    placeholder="参加費（例: 無料 / 500円）"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    value={form.maxParticipants ? String(form.maxParticipants) : ''}
                    onChangeText={(v) => set({ maxParticipants: v ? Number(v) : undefined })}
                    placeholder="最大参加人数"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              ) : null}

              {form.category === 'help' ? (
                <View style={styles.fieldsGap}>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.halfBtn, form.helpType === 'request' && styles.halfBtnActive]}
                      onPress={() => set({ helpType: 'request' })}
                    >
                      <Ionicons
                        name="hand-right-outline"
                        size={16}
                        color={form.helpType === 'request' ? '#fff' : Colors.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.halfBtnText, form.helpType === 'request' && styles.halfBtnTextActive]}>
                        お願い
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.halfBtn, form.helpType === 'share' && styles.halfBtnActive]}
                      onPress={() => set({ helpType: 'share' })}
                    >
                      <Ionicons
                        name="heart-outline"
                        size={16}
                        color={form.helpType === 'share' ? '#fff' : Colors.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.halfBtnText, form.helpType === 'share' && styles.halfBtnTextActive]}>
                        提供
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={form.reward}
                    onChangeText={(v) => set({ reward: v })}
                    placeholder="お礼・提供内容"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    value={form.estimatedTime}
                    onChangeText={(v) => set({ estimatedTime: v })}
                    placeholder="所要時間の目安"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              ) : null}

              {form.category === 'admin' ? (
                <View style={styles.fieldsGap}>
                  <TouchableOpacity style={styles.inputLike} onPress={() => openCalendar('deadline')}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                    <Text style={[styles.inputLikeText, !form.deadline && styles.inputLikePlaceholder]}>
                      {form.deadline || '締切日を選択'}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={Array.isArray(form.requirements) ? form.requirements.join('\n') : ''}
                    onChangeText={(v) => set({ requirements: v.split('\n').map((item) => item.trim()).filter(Boolean) })}
                    placeholder="必要なもの（1行に1つ）"
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.divider} />

            {/* Comments toggle */}
            <View style={styles.sectionRow}>
              <View style={styles.rowIcon}>
                <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.sectionLabel}>コメントを許可</Text>
              </View>
              <Switch
                value={form.allowComments}
                onValueChange={(v) => set({ allowComments: v })}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </>
        )}

        {/* ──── Step 3: Location & Confirm ──── */}
        {step === 3 && (
          <>
            {/* Location */}
            <View style={styles.section}>
              <View style={styles.rowIcon}>
                <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.sectionLabel}>位置情報</Text>
              </View>
              <Text style={styles.locationText}>{locationHint}</Text>

              {/* Manual location fallback */}
              {!showManualLocation ? (
                <TouchableOpacity
                  style={styles.manualLocationToggle}
                  onPress={() => setShowManualLocation(true)}
                >
                  <Ionicons name="create-outline" size={16} color={Colors.primary} />
                  <Text style={styles.manualLocationToggleText}>手動で場所を入力</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.manualLocationFields}>
                  <Text style={styles.manualLocationDivider}>または</Text>
                  <TextInput
                    style={styles.input}
                    value={manualPlace.name}
                    onChangeText={(v) => setManualPlace((prev) => ({ ...prev, name: v }))}
                    placeholder="場所の名前"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    value={manualPlace.address}
                    onChangeText={(v) => setManualPlace((prev) => ({ ...prev, address: v }))}
                    placeholder="住所"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.manualLocationClear}
                    onPress={() => {
                      setManualPlace({ name: '', address: '' });
                      setShowManualLocation(false);
                    }}
                  >
                    <Text style={styles.manualLocationClearText}>手動入力をクリア</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Summary card */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>投稿プレビュー</Text>
              <View style={styles.summaryCard}>
                {/* Category badge */}
                <View style={[styles.summaryBadge, { backgroundColor: category.color }]}>
                  <Ionicons
                    name={getCategoryIconName(form.category) as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.summaryBadgeText}>{category.label}</Text>
                </View>

                {/* Title preview */}
                <Text style={styles.summaryTitle} numberOfLines={2}>
                  {form.title || '(タイトル未入力)'}
                </Text>

                {/* Content preview */}
                {form.content ? (
                  <Text style={styles.summaryContent} numberOfLines={2}>
                    {form.content}
                  </Text>
                ) : null}

                {/* Image count */}
                {form.images.length > 0 && (
                  <View style={styles.summaryImageRow}>
                    <Ionicons name="image-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.summaryMeta}>{form.images.length}枚の画像</Text>
                  </View>
                )}

                {/* Location */}
                <View style={styles.summaryLocationRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.summaryMeta} numberOfLines={1}>{locationHint}</Text>
                </View>

                {/* Comments */}
                <View style={styles.summaryLocationRow}>
                  <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.summaryMeta}>
                    コメント: {form.allowComments ? '許可' : '不許可'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

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

  /* Sections */
  section: {
    gap: 10,
    marginBottom: 8,
  },
  sectionGrouped: {
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  required: {
    color: Colors.danger,
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  rowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* Category grid: 2x2 */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryBtn: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  categoryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryBtnTextActive: { color: '#fff' },

  /* Inputs */
  input: {
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textarea: { minHeight: 100, paddingTop: 13 },
  inputLike: {
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputLikeText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputLikePlaceholder: {
    color: Colors.textMuted,
  },

  /* Fields gap */
  fieldsGap: {
    gap: 10,
  },

  /* Chips */
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  /* Row helpers */
  row: { flexDirection: 'row', gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  halfBtn: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  halfBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  halfBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  halfBtnTextActive: { color: '#fff' },

  /* Location */
  locationText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  /* Manual location */
  manualLocationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  manualLocationToggleText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  manualLocationFields: {
    gap: 10,
    marginTop: 4,
  },
  manualLocationDivider: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  manualLocationClear: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  manualLocationClearText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },

  /* Summary card */
  summaryCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryContent: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  summaryImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
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

  /* Images */
  imageAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: Colors.primary,
  },
  imageAddText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  imageRow: {
    gap: 10,
    paddingVertical: 4,
  },
  previewWrap: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
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
