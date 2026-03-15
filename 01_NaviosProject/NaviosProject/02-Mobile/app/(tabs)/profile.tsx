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
  Platform,
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

type PostTab = 'active' | 'commented';

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
  const [editingEmail, setEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

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
  const commentedPosts = useMemo(() => posts.filter((p) => p.comments > 0), [posts]);
  const displayPosts = postTab === 'active' ? activePosts : commentedPosts;
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

  const handleSaveEmail = async () => {
    if (!user || !profile) return;
    const trimmed = editedEmail.trim().toLowerCase();
    if (!trimmed) return;
    if (trimmed === profile.email) { setEditingEmail(false); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return;
    }
    setSavingEmail(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ email: trimmed });
      if (authError) throw authError;
      await supabase.from('users').update({ email: trimmed }).eq('id', user.id);
      setProfile((prev) => (prev ? { ...prev, email: trimmed } : prev));
      setEditingEmail(false);
      Alert.alert('確認メールを送信しました', '新しいメールアドレスに届いた確認リンクをクリックしてください。');
    } catch (err) {
      Alert.alert('エラー', err instanceof Error ? err.message : 'メールアドレスの更新に失敗しました。');
    } finally {
      setSavingEmail(false);
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

  if (!user) {
    return (
      <SafeAreaView style={styles.guestContainer}>
        <View style={styles.guestContent}>
          <View style={styles.guestIconCircle}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.guestTitle}>マイページ</Text>
          <Text style={styles.guestSub}>
            ログインすると、投稿の管理やプロフィール編集ができます
          </Text>
          <TouchableOpacity style={styles.guestLoginBtn} onPress={() => router.push('/auth/login')} activeOpacity={0.8}>
            <Ionicons name="log-in-outline" size={18} color="#fff" />
            <Text style={styles.guestLoginBtnText}>ログイン</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/auth/register')} activeOpacity={0.7}>
            <Text style={styles.guestRegisterText}>アカウントを作成する</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Hero header with gradient */}
        <View style={styles.heroSection}>
          <View style={styles.heroBg} />
          <View style={styles.heroContent}>
            <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar} style={styles.avatarWrapper} activeOpacity={0.8}>
              <UserAvatar avatar={profile.avatar} size={80} backgroundColor={Colors.avatarGreen} />
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

        {/* Stats cards — 2x2 grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsGridRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="document-text" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{posts.length}</Text>
              <Text style={styles.statLabel}>投稿</Text>
            </View>
            <TouchableOpacity
              style={[styles.statCard, postTab === 'active' && styles.statCardActive]}
              activeOpacity={0.7}
              onPress={() => setPostTab('active')}
            >
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="radio" size={18} color={Colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: Colors.warning }]}>{activePosts.length}</Text>
              <Text style={styles.statLabel}>公開中</Text>
              {postTab === 'active' ? <View style={[styles.statActiveBar, { backgroundColor: Colors.warning }]} /> : null}
            </TouchableOpacity>
          </View>
          <View style={styles.statsGridRow}>
            <TouchableOpacity
              style={[styles.statCard, postTab === 'commented' && styles.statCardActive]}
              activeOpacity={0.7}
              onPress={() => setPostTab('commented')}
            >
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="chatbubble-ellipses" size={18} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: Colors.blue }]}>{totalComments}</Text>
              <Text style={styles.statLabel}>コメント</Text>
              {postTab === 'commented' ? <View style={[styles.statActiveBar, { backgroundColor: Colors.blue }]} /> : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/talk' as any)}
            >
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="chatbubbles" size={18} color={Colors.purple} />
              </View>
              <Text style={[styles.statValue, { color: Colors.purple }]}>0</Text>
              <Text style={styles.statLabel}>チャット</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* Posts section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="list-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>
                {postTab === 'active' ? '公開中の投稿' : 'コメントがある投稿'}
              </Text>
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
                        {post.status === 'ended' ? (
                          <>
                            <View style={styles.postMetaDot} />
                            <Text style={[styles.postMeta, { color: Colors.textMuted, fontWeight: '600' }]}>終了</Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
              {displayPosts.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons
                    name={postTab === 'commented' ? 'chatbubble-outline' : 'document-text-outline'}
                    size={32}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.emptyText}>
                    {postTab === 'commented' ? 'コメントがある投稿はありません' : '公開中の投稿はありません'}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Account section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: Colors.textSecondary }]}>
                <Ionicons name="settings-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>アカウント</Text>
            </View>

            <View style={styles.menuList}>
              {editingEmail ? (
                <View style={styles.menuItemEdit}>
                  <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                  <TextInput
                    style={styles.menuEditInput}
                    value={editedEmail}
                    onChangeText={setEditedEmail}
                    autoFocus
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveEmail}
                    placeholder="新しいメールアドレス"
                    placeholderTextColor={Colors.textMuted}
                    editable={!savingEmail}
                  />
                  <TouchableOpacity onPress={handleSaveEmail} disabled={savingEmail} style={styles.menuEditBtn}>
                    {savingEmail ? <ActivityIndicator size={14} color={Colors.primary} /> : <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingEmail(false)} style={styles.menuEditBtn}>
                    <Ionicons name="close" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setEditedEmail(profile.email); setEditingEmail(true); }}
                  activeOpacity={0.6}
                >
                  <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.menuLabel}>メールアドレス</Text>
                  <Text style={styles.menuValue} numberOfLines={1}>{profile.email}</Text>
                  <Ionicons name="pencil-outline" size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
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
              <Ionicons name="log-out-outline" size={18} color={Colors.dangerDark} />
              <Text style={styles.logoutText}>{submittingLogout ? 'ログアウト中...' : 'ログアウト'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating post button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/post/create' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Guest
  guestContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  guestContent: { alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  guestIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  guestTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  guestSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  guestLoginBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  guestLoginBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  guestRegisterText: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginTop: 4 },
  skeletonContainer: { flex: 1, backgroundColor: Colors.surface, padding: 24 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.surface, padding: 24 },
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
    height: 130,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
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
    borderBottomColor: Colors.primary,
    paddingVertical: 4,
    textAlign: 'center',
  },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedChipText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  heroEmail: { fontSize: 12, color: Colors.textSecondary },

  // Stats grid (2x2)
  statsGrid: {
    gap: 10,
    marginHorizontal: 16,
    marginTop: -6,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  statCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statActiveBar: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },

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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Post list
  postList: { gap: 8 },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
  menuItemEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  menuEditInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 4,
  },
  menuEditBtn: {
    padding: 4,
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
    backgroundColor: Colors.border,
    marginLeft: 42,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    backgroundColor: Colors.dangerBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: Colors.dangerDark },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
