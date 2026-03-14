import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import UserAvatar from '../../components/common/UserAvatar';
import CategoryBadge from '../../components/common/CategoryBadge';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
import { getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { optimizeImage } from '../../lib/postService';
import type { CategoryId } from '../../constants/categories';

type PostTab = 'active' | 'ended';

type ProfileData = {
  displayName: string;
  avatar: string;
  verified: boolean;
  email: string;
  phone?: string | null;
};

type MyPostRow = {
  id: string;
  title: string;
  category: CategoryId;
  status: 'active' | 'ended';
  createdAt: string;
  comments: number;
};

function formatPostTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'たった今';
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}日前`;
  return date.toLocaleDateString();
}

function getFileExtension(uri: string) {
  const matched = uri.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
  const ext = matched?.[1] ?? 'jpg';
  if (ext === 'jpeg') return 'jpg';
  return ext;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<MyPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postTab, setPostTab] = useState<PostTab>('active');
  const [submittingLogout, setSubmittingLogout] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        setError('ログインしていません。');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [profileResult, postsResult] = await Promise.all([
          supabase
            .from('users')
            .select('display_name, avatar, verified, email, phone')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('posts')
            .select('id, title, category, is_ended, created_at, comments(id)')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50),
        ]);
        if (profileResult.error) throw profileResult.error;
        if (postsResult.error) throw postsResult.error;

        const profileRow = profileResult.data;
        const avatarValue = profileRow?.avatar ?? '';
        const displayName = profileRow?.display_name ?? user.email?.split('@')[0] ?? 'User';

        setProfile({
          displayName,
          avatar: avatarValue.startsWith('http')
            ? avatarValue
            : (displayName.charAt(0) || 'U').toUpperCase(),
          verified: Boolean(profileRow?.verified),
          email: profileRow?.email ?? user.email ?? '',
          phone: profileRow?.phone ?? null,
        });

        setPosts(
          (postsResult.data ?? []).map((row: any) => ({
            id: row.id,
            title: row.title ?? '',
            category: row.category as CategoryId,
            status: row.is_ended ? 'ended' : 'active',
            createdAt: formatPostTime(row.created_at),
            comments: Array.isArray(row.comments) ? row.comments.length : 0,
          })),
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'プロフィール取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const activePosts = useMemo(() => posts.filter((p) => p.status === 'active'), [posts]);
  const endedPosts = useMemo(() => posts.filter((p) => p.status === 'ended'), [posts]);
  const displayPosts = postTab === 'active' ? activePosts : endedPosts;
  const totalComments = useMemo(() => posts.reduce((sum, post) => sum + post.comments, 0), [posts]);

  const handlePickAvatar = async () => {
    if (!user || uploadingAvatar) return;
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('権限エラー', '画像ライブラリへのアクセスを許可してください。');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) return;

    setUploadingAvatar(true);
    try {
      const optimizedUri = await optimizeImage(pickerResult.assets[0].uri, 400, 0.7);
      const ext = getFileExtension(optimizedUri);
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const response = await fetch(optimizedUri);
      if (!response.ok) throw new Error('画像の読み込みに失敗しました。');
      const fileData = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileData, { contentType: `image/${ext}`, upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!publicData.publicUrl) throw new Error('公開URLの取得に失敗しました。');

      await supabase.from('users').update({ avatar: publicData.publicUrl }).eq('id', user.id);
      setProfile((prev) => (prev ? { ...prev, avatar: publicData.publicUrl } : prev));
    } catch (err) {
      Alert.alert('エラー', err instanceof Error ? err.message : 'アバターの更新に失敗しました。');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    if (!user || !profile) return;
    const trimmed = editedName.trim();
    if (!trimmed) return;
    if (trimmed === profile.displayName) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const { error: updateError } = await supabase.from('users').update({ display_name: trimmed }).eq('id', user.id);
      if (updateError) throw updateError;
      setProfile((prev) => (prev ? { ...prev, displayName: trimmed } : prev));
      setEditingName(false);
    } catch (err) {
      Alert.alert('エラー', err instanceof Error ? err.message : '表示名の更新に失敗しました。');
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    if (submittingLogout) return;
    setSubmittingLogout(true);
    try {
      await signOut();
    } catch (logoutError) {
      Alert.alert('ログアウトに失敗しました', logoutError instanceof Error ? logoutError.message : '');
    } finally {
      setSubmittingLogout(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.skeletonContainer}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.danger} />
        <Text style={styles.errorText}>{error ?? 'プロフィール取得に失敗しました'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <View style={styles.heroSection}>
          <View style={styles.heroBg} />
          <View style={styles.heroContent}>
            <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar} style={styles.avatarWrapper} activeOpacity={0.8}>
              <UserAvatar avatar={profile.avatar} size={80} backgroundColor="#A7F3D0" />
              <View style={styles.cameraOverlay}>
                {uploadingAvatar ? (
                  <ActivityIndicator size={14} color="#fff" />
                ) : (
                  <Ionicons name="camera" size={14} color="#fff" />
                )}
              </View>
            </TouchableOpacity>

            {editingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={styles.editNameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                  placeholder="表示名を入力"
                  placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity onPress={handleSaveName} disabled={savingName} style={styles.saveBtn}>
                  {savingName ? <ActivityIndicator size={14} color="#fff" /> : <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingName(false)} style={styles.cancelBtn}>
                  <Ionicons name="close" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditedName(profile.displayName); setEditingName(true); }}
                style={styles.nameRow}
                activeOpacity={0.7}
              >
                <Text style={styles.heroName}>{profile.displayName}</Text>
                <Ionicons name="pencil-outline" size={14} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}

            <View style={styles.heroBadges}>
              {profile.verified ? (
                <View style={styles.verifiedChip}>
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                  <Text style={styles.verifiedChipText}>認証済み</Text>
                </View>
              ) : null}
              <Text style={styles.heroEmail}>{profile.email}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsBar}>
          <StatItem icon="document-text-outline" value={posts.length} label="投稿" color="#10B981" />
          <View style={styles.statDivider} />
          <StatItem icon="radio-outline" value={activePosts.length} label="公開中" color="#F59E0B" />
          <View style={styles.statDivider} />
          <StatItem icon="chatbubble-outline" value={totalComments} label="コメント" color="#3B82F6" />
        </View>

        <View style={styles.body}>
          {/* My posts section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="list-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>自分の投稿</Text>
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, postTab === 'active' && styles.tabItemActive]}
                onPress={() => setPostTab('active')}
              >
                <Ionicons name="radio-outline" size={14} color={postTab === 'active' ? '#10B981' : Colors.textMuted} />
                <Text style={[styles.tabLabel, postTab === 'active' && styles.tabLabelActive]}>
                  公開中 ({activePosts.length})
                </Text>
                {postTab === 'active' ? <View style={styles.tabIndicator} /> : null}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, postTab === 'ended' && styles.tabItemActive]}
                onPress={() => setPostTab('ended')}
              >
                <Ionicons name="archive-outline" size={14} color={postTab === 'ended' ? '#64748B' : Colors.textMuted} />
                <Text style={[styles.tabLabel, postTab === 'ended' && styles.tabLabelEnded]}>
                  終了済み ({endedPosts.length})
                </Text>
                {postTab === 'ended' ? <View style={[styles.tabIndicator, { backgroundColor: '#64748B' }]} /> : null}
              </TouchableOpacity>
            </View>

            <View style={styles.postList}>
              {displayPosts.map((post) => {
                const cat = getCategoryInfo(post.category);
                const iconName = getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap;
                return (
                  <TouchableOpacity
                    key={post.id}
                    style={[styles.postCard, post.status === 'ended' && styles.postCardEnded]}
                    onPress={() => router.push(`/post/${post.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.postIconBox, { backgroundColor: cat.color }]}>
                      <Ionicons name={iconName} size={16} color="#fff" />
                    </View>
                    <View style={styles.postBody}>
                      <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
                      <View style={styles.postMetaRow}>
                        <Text style={styles.postMeta}>{post.createdAt}</Text>
                        <View style={styles.postMetaDot} />
                        <Ionicons name="chatbubble-outline" size={10} color={Colors.textMuted} />
                        <Text style={styles.postMeta}>{post.comments}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
              {displayPosts.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name={postTab === 'ended' ? 'archive-outline' : 'document-text-outline'} size={32} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>
                    {postTab === 'ended' ? '終了した投稿はまだありません' : '公開中の投稿はありません'}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Account section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: '#64748B' }]}>
                <Ionicons name="settings-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>アカウント</Text>
            </View>

            <View style={styles.menuList}>
              <View style={styles.menuItem}>
                <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.menuLabel}>メールアドレス</Text>
                <Text style={styles.menuValue} numberOfLines={1}>{profile.email}</Text>
              </View>
              <View style={styles.menuDivider} />
              <View style={styles.menuItem}>
                <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.menuLabel}>電話番号</Text>
                <Text style={[styles.menuValue, !profile.phone && styles.menuValueMuted]}>
                  {profile.phone || '未設定'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.logoutButton, submittingLogout && { opacity: 0.6 }]}
              onPress={handleLogout}
              disabled={submittingLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              <Text style={styles.logoutText}>{submittingLogout ? 'ログアウト中...' : 'ログアウト'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ icon, value, label, color }: { icon: keyof typeof Ionicons.glyphMap; value: number; label: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  skeletonContainer: { flex: 1, backgroundColor: '#fff', padding: 24 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', padding: 24 },
  errorText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  // Hero
  heroSection: {
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 20,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#10B981',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  editNameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
    paddingVertical: 4,
    textAlign: 'center',
  },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedChipText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  heroEmail: { fontSize: 12, color: Colors.textSecondary },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },

  // Body
  body: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    position: 'relative',
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabLabelActive: { color: '#10B981', fontWeight: '700' },
  tabLabelEnded: { color: '#64748B', fontWeight: '700' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },

  // Post list
  postList: { gap: 8 },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  postCardEnded: {
    opacity: 0.65,
  },
  postIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBody: { flex: 1, gap: 3 },
  postTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postMeta: { fontSize: 11, color: Colors.textMuted },
  postMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: { fontSize: 13, color: Colors.textMuted },

  // Menu list
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  menuValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'right',
    fontWeight: '600',
  },
  menuValueMuted: { color: Colors.textMuted, fontWeight: '400' },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginLeft: 42,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
});
