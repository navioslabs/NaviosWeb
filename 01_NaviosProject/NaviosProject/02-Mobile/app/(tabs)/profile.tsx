/**
 * ProfileScreen - マイページ
 * mock.jsx: view === 'profile' の画面
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../../components/common/UserAvatar';
import CategoryBadge from '../../components/common/CategoryBadge';
import { Colors } from '../../constants/colors';
import { MOCK_CURRENT_USER, MOCK_MY_POSTS } from '../../lib/mockData';
import { CategoryId } from '../../constants/categories';
import { MyPost } from '../../types';

type PostTab = 'active' | 'ended';

type SettingItem = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
};

const SETTING_ITEMS: SettingItem[] = [
  { iconName: 'notifications-outline', label: '通知設定', sub: 'プッシュ通知のON/OFF' },
  { iconName: 'location-outline', label: '位置情報設定', sub: '現在地の取得設定' },
  { iconName: 'lock-closed-outline', label: 'プライバシー', sub: '公開範囲の設定' },
];

export default function ProfileScreen() {
  const [postTab, setPostTab] = useState<PostTab>('active');
  const user = MOCK_CURRENT_USER;
  const activePosts = MOCK_MY_POSTS.filter((p) => p.status === 'active');
  const endedPosts = MOCK_MY_POSTS.filter((p) => p.status === 'ended');
  const displayPosts = postTab === 'active' ? activePosts : endedPosts;

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>マイページ</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* プロフィールカード */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <UserAvatar avatar={user.avatar} size={64} backgroundColor="#A7F3D0" />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{user.displayName}</Text>
                {user.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#059669" />
                    <Text style={styles.verifiedText}>認証済み</Text>
                  </View>
                )}
              </View>
              <Text style={styles.location}>{user.location}</Text>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={14} color={Colors.textPrimary} />
            <Text style={styles.editButtonText}>プロフィールを編集</Text>
          </TouchableOpacity>
        </View>

        {/* 活動統計 */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="bar-chart-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.sectionTitle}>あなたの活動</Text>
          </View>
          <View style={styles.statsRow}>
            <StatBox label="投稿" value={user.stats!.posts} color="#059669" bg="#ECFDF5" />
            <StatBox label="協力" value={user.stats!.helped} color="#BE123C" bg="#FFF1F2" />
            <StatBox label="コメント" value={user.stats!.comments} color="#1D4ED8" bg="#EFF6FF" />
          </View>
        </View>

        {/* 自分の投稿 */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.sectionTitle}>自分の投稿</Text>
          </View>

          {/* タブ */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, postTab === 'active' && styles.tabActive]}
              onPress={() => setPostTab('active')}
            >
              <Text style={[styles.tabText, postTab === 'active' && styles.tabTextActive]}>
                公開中 ({activePosts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, postTab === 'ended' && styles.tabEnded]}
              onPress={() => setPostTab('ended')}
            >
              <Text style={[styles.tabText, postTab === 'ended' && styles.tabTextEnded]}>
                終了済み ({endedPosts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* 投稿リスト */}
          <View style={styles.postList}>
            {displayPosts.map((post: MyPost) => (
              <View
                key={post.id}
                style={[styles.postItem, post.status === 'ended' && styles.postItemEnded]}
              >
                <CategoryBadge categoryId={post.category as CategoryId} size="sm" />
                <View style={styles.postBody}>
                  <Text
                    style={[styles.postTitle, post.status === 'ended' && styles.postTitleEnded]}
                    numberOfLines={1}
                  >
                    {post.title}
                  </Text>
                  <View style={styles.postMetaRow}>
                    <Text style={styles.postMeta}>{post.time}</Text>
                    <View style={styles.metaStat}>
                      <Ionicons name="eye-outline" size={11} color={Colors.textMuted} />
                      <Text style={styles.postMeta}>{post.views}</Text>
                    </View>
                    <View style={styles.metaStat}>
                      <Ionicons name="chatbubble-outline" size={11} color={Colors.textMuted} />
                      <Text style={styles.postMeta}>{post.comments}</Text>
                    </View>
                  </View>
                </View>
                {post.status === 'active' ? (
                  <TouchableOpacity style={styles.editBtn}>
                    <Text style={styles.editBtnText}>編集</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.endedBadge}>
                    <Text style={styles.endedBadgeText}>終了</Text>
                  </View>
                )}
              </View>
            ))}
            {displayPosts.length === 0 && (
              <Text style={styles.emptyText}>
                {postTab === 'active' ? '公開中の投稿はありません' : '終了済みの投稿はありません'}
              </Text>
            )}
          </View>
        </View>

        {/* 設定メニュー */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="settings-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.sectionTitle}>設定</Text>
          </View>
          {SETTING_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingRow}>
              <View style={styles.settingIconBox}>
                <Ionicons name={item.iconName} size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingSubLabel}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <View style={[styles.statBox, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  settingsBtn: { padding: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  profileRow: { flexDirection: 'row', gap: 12 },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  displayName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  location: { fontSize: 13, color: Colors.textSecondary },
  bio: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
  },
  editButtonText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabEnded: { backgroundColor: '#475569' },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  tabTextEnded: { color: '#fff' },
  postList: { gap: 8 },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  postItemEnded: { backgroundColor: Colors.surfaceSecondary },
  postBody: { flex: 1, gap: 4 },
  postTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  postTitleEnded: { color: Colors.textSecondary },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postMeta: { fontSize: 11, color: Colors.textMuted },
  metaStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
  },
  editBtnText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  endedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  endedBadgeText: { fontSize: 11, color: Colors.textSecondary },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', padding: 16 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  settingSubLabel: { fontSize: 11, color: Colors.textSecondary },
  logoutButton: {
    marginTop: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: { fontSize: 13, fontWeight: '600', color: Colors.danger },
});
