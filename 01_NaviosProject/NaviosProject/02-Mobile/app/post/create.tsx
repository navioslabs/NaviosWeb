/**
 * CreatePostScreen - 投稿作成画面
 * mock.jsx: view === 'post' の画面
 * カテゴリ別フォームフィールドを持つ投稿作成UI
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CATEGORIES, CategoryId, getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { PostFormData } from '../../types';
import { Colors } from '../../constants/colors';

const STOCK_DURATION_OPTIONS = [
  { value: 'today', label: '今日中' },
  { value: '48hours', label: '明日まで' },
  { value: '3days', label: '3日間' },
  { value: '1week', label: '1週間' },
  { value: 'manual', label: '手動で終了' },
] as const;

const CATEGORY_TIPS: Record<CategoryId, string[]> = {
  stock: ['数量制限があれば明記しましょう', '価格は税込みで記載すると親切です', '在庫状況をこまめに更新しましょう'],
  event: ['集合場所を具体的に書きましょう', '持ち物があれば記載しましょう', '雨天時の対応も書くと親切です'],
  help: ['具体的な作業内容を書きましょう', 'お礼の内容を明記すると◎', '所要時間の目安があると助かります'],
  admin: ['申請期限を必ず記載しましょう', '必要書類を箇条書きで', '問い合わせ先も記載しましょう'],
};

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

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<PostFormData>(INITIAL_FORM);

  const set = (patch: Partial<PostFormData>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    if (!form.title.trim()) {
      Alert.alert('入力エラー', 'タイトルを入力してください');
      return;
    }
    Alert.alert('投稿しました！（デモ）', '', [
      {
        text: 'OK',
        onPress: () => {
          setForm(INITIAL_FORM);
          router.back();
        },
      },
    ]);
  };

  const cat = getCategoryInfo(form.category);
  const tips = CATEGORY_TIPS[form.category];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>情報を投稿</Text>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>投稿</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* カテゴリ選択 */}
        <View style={styles.section}>
          <Text style={styles.label}>カテゴリ</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((c) => {
              const isActive = form.category === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.categoryButton,
                    isActive ? { backgroundColor: c.color } : styles.categoryButtonInactive,
                  ]}
                  onPress={() => set({ category: c.id })}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={getCategoryIconName(c.id) as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={isActive ? '#fff' : Colors.textSecondary}
                  />
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 写真 */}
        <View style={styles.section}>
          <Text style={styles.label}>写真（任意）</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoButton} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.photoLabel}>撮影</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} activeOpacity={0.7}>
              <Ionicons name="images-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.photoLabel}>選択</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* タイトル */}
        <View style={styles.section}>
          <Text style={styles.label}>
            タイトル <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(v) => set({ title: v })}
            placeholder="例: 卵入荷しました"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* 詳細 */}
        <View style={styles.section}>
          <Text style={styles.label}>詳細（任意）</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.content}
            onChangeText={(v) => set({ content: v })}
            placeholder="詳しい情報を入力..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* カテゴリ別フィールド */}
        <View style={styles.categoryDetailBox}>
          <View style={styles.categoryDetailHeader}>
            <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
            <Text style={styles.categoryDetailTitle}>{cat.label}情報</Text>
          </View>

          {/* 物資 */}
          {form.category === 'stock' && (
            <View style={styles.fieldGroup}>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.subLabel}>価格</Text>
                  <TextInput
                    style={styles.inputSm}
                    value={form.price}
                    onChangeText={(v) => set({ price: v })}
                    placeholder="¥280"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.subLabel}>在庫状況</Text>
                  <View style={styles.selectRow}>
                    {(['在庫あり', '残りわずか', '入荷予定'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.selectOption,
                          form.stockStatus === s && { backgroundColor: cat.color },
                        ]}
                        onPress={() => set({ stockStatus: s })}
                      >
                        <Text
                          style={[
                            styles.selectOptionText,
                            form.stockStatus === s && styles.selectOptionTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <View>
                <Text style={styles.subLabel}>表示期間</Text>
                <View style={styles.durationRow}>
                  {STOCK_DURATION_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.durationButton,
                        form.stockDuration === opt.value && { backgroundColor: '#10B981' },
                      ]}
                      onPress={() => set({ stockDuration: opt.value })}
                    >
                      <Text
                        style={[
                          styles.durationButtonText,
                          form.stockDuration === opt.value && styles.durationButtonTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* イベント */}
          {form.category === 'event' && (
            <View style={styles.fieldGroup}>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.subLabel}>開催日</Text>
                  <TextInput
                    style={styles.inputSm}
                    value={form.eventDate}
                    onChangeText={(v) => set({ eventDate: v })}
                    placeholder="2026-03-15"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.subLabel}>開始時間</Text>
                  <TextInput
                    style={styles.inputSm}
                    value={form.eventTime}
                    onChangeText={(v) => set({ eventTime: v })}
                    placeholder="10:00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.subLabel}>参加費</Text>
                  <TextInput
                    style={styles.inputSm}
                    value={form.fee}
                    onChangeText={(v) => set({ fee: v })}
                    placeholder="無料"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.subLabel}>定員</Text>
                  <TextInput
                    style={styles.inputSm}
                    value={form.maxParticipants?.toString() ?? ''}
                    onChangeText={(v) => set({ maxParticipants: v ? Number(v) : undefined })}
                    placeholder="20"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={[styles.infoNote, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="calendar-outline" size={13} color="#92400E" />
                <Text style={[styles.infoNoteText, { color: '#92400E' }]}>
                  開催日の23:59まで表示されます
                </Text>
              </View>
            </View>
          )}

          {/* 近助 */}
          {form.category === 'help' && (
            <View style={styles.fieldGroup}>
              <View>
                <Text style={styles.subLabel}>タイプ</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      form.helpType === 'request' && { backgroundColor: '#F43F5E' },
                    ]}
                    onPress={() => set({ helpType: 'request' })}
                  >
                    <Ionicons
                      name="hand-left-outline"
                      size={14}
                      color={form.helpType === 'request' ? '#fff' : Colors.textSecondary}
                    />
                    <Text style={[styles.typeButtonText, form.helpType === 'request' && styles.typeButtonTextActive]}>
                      お願い
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      form.helpType === 'share' && { backgroundColor: '#F43F5E' },
                    ]}
                    onPress={() => set({ helpType: 'share' })}
                  >
                    <Ionicons
                      name="gift-outline"
                      size={14}
                      color={form.helpType === 'share' ? '#fff' : Colors.textSecondary}
                    />
                    <Text style={[styles.typeButtonText, form.helpType === 'share' && styles.typeButtonTextActive]}>
                      お裾分け
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text style={styles.subLabel}>
                  {form.helpType === 'request' ? 'お礼' : 'お裾分け品'}
                </Text>
                <TextInput
                  style={styles.inputSm}
                  value={form.reward}
                  onChangeText={(v) => set({ reward: v })}
                  placeholder={form.helpType === 'request' ? '自家製野菜' : '大根2本'}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              {form.helpType === 'request' && (
                <View>
                  <Text style={styles.subLabel}>所要時間の目安</Text>
                  <TextInput
                    style={styles.inputSm}
                    value={form.estimatedTime}
                    onChangeText={(v) => set({ estimatedTime: v })}
                    placeholder="30分〜1時間"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              )}
              <View style={[styles.infoNote, { backgroundColor: '#FFF1F2' }]}>
                <Ionicons name="timer-outline" size={13} color="#9F1239" />
                <Text style={[styles.infoNoteText, { color: '#9F1239' }]}>
                  48時間後に自動で非表示になります（手動で終了も可）
                </Text>
              </View>
            </View>
          )}

          {/* 行政 */}
          {form.category === 'admin' && (
            <View style={styles.fieldGroup}>
              <View>
                <Text style={styles.subLabel}>申請期限</Text>
                <TextInput
                  style={styles.inputSm}
                  value={form.deadline}
                  onChangeText={(v) => set({ deadline: v })}
                  placeholder="2026-03-31"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View>
                <Text style={styles.subLabel}>必要書類（改行区切り）</Text>
                <TextInput
                  style={[styles.inputSm, styles.textarea]}
                  value={Array.isArray(form.requirements) ? form.requirements.join('\n') : ''}
                  onChangeText={(v) => set({ requirements: v.split('\n') })}
                  placeholder={'届いたハガキ\n本人確認書類\n振込口座がわかるもの'}
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <View style={[styles.infoNote, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="document-text-outline" size={13} color="#4C1D95" />
                <Text style={[styles.infoNoteText, { color: '#4C1D95' }]}>
                  申請期限まで表示されます
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 場所 */}
        <View style={styles.categoryDetailBox}>
          <View style={styles.categoryDetailHeader}>
            <Ionicons name="location-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.categoryDetailTitle}>場所</Text>
          </View>
          <TouchableOpacity style={styles.locationButton} activeOpacity={0.7}>
            <View style={styles.locationLeft}>
              <Ionicons name="locate-outline" size={16} color={Colors.primary} />
              <Text style={styles.locationText}>現在地を使用</Text>
            </View>
            <Text style={styles.locationHint}>伊集院町付近</Text>
          </TouchableOpacity>
        </View>

        {/* コメント設定 */}
        <View style={styles.categoryDetailBox}>
          <View style={styles.commentRow}>
            <View style={styles.commentLeft}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.categoryDetailTitle}>コメントを受け付ける</Text>
            </View>
            <Switch
              value={form.allowComments}
              onValueChange={(v) => set({ allowComments: v })}
              trackColor={{ false: Colors.border, true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 投稿のコツ */}
        <View style={styles.tipsBox}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={16} color="#92400E" />
            <Text style={styles.tipsTitle}>投稿のコツ</Text>
          </View>
          {tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-outline" size={13} color="#92400E" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#10B981',
    borderRadius: 20,
  },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  required: { color: Colors.danger },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryButtonInactive: { backgroundColor: Colors.surfaceSecondary },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  categoryLabelActive: { color: '#fff' },
  photoRow: { flexDirection: 'row', gap: 8 },
  photoButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  photoLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textarea: { minHeight: 80, paddingTop: 12 },
  categoryDetailBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  categoryDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryDot: { width: 20, height: 20, borderRadius: 10 },
  categoryDetailTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  fieldGroup: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  subLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  inputSm: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  selectRow: { gap: 4 },
  selectOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  selectOptionText: { fontSize: 11, color: Colors.textSecondary },
  selectOptionTextActive: { color: '#fff', fontWeight: '700' },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  durationButtonText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  durationButtonTextActive: { color: '#fff' },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoNoteText: { flex: 1, fontSize: 11 },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  typeButtonText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  typeButtonTextActive: { color: '#fff' },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationText: { fontSize: 13, color: Colors.textSecondary },
  locationHint: { fontSize: 11, color: Colors.textMuted },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipsBox: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  tipText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
});
