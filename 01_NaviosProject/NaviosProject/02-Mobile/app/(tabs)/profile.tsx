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
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import UserAvatar from '../../components/common/UserAvatar';
import CategoryBadge from '../../components/common/CategoryBadge';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
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
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<MyPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postTab, setPostTab] = useState<PostTab>('active');
  const [submittingLogout, setSubmittingLogout] = useState(false);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Display name editing state
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        setError('User is not logged in.');
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

        const mappedPosts = (postsResult.data ?? []).map((row: any) => ({
          id: row.id,
          title: row.title ?? '',
          category: row.category as CategoryId,
          status: row.is_ended ? 'ended' : 'active',
          createdAt: formatPostTime(row.created_at),
          comments: Array.isArray(row.comments) ? row.comments.length : 0,
        }));

        setPosts(mappedPosts);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load profile.';
        setError(message);
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
      const originalUri = pickerResult.assets[0].uri;
      const optimizedUri = await optimizeImage(originalUri, 400, 0.7);

      const ext = getFileExtension(optimizedUri);
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const response = await fetch(optimizedUri);
      if (!response.ok) throw new Error('画像の読み込みに失敗しました。');
      const fileData = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileData, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;
      if (!publicUrl) throw new Error('公開URLの取得に失敗しました。');

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar: publicUrl } : prev));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'アバターの更新に失敗しました。';
      Alert.alert('エラー', message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleStartEditName = () => {
    if (!profile) return;
    setEditedName(profile.displayName);
    setEditingName(true);
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setEditedName('');
  };

  const handleSaveName = async () => {
    if (!user || !profile) return;
    const trimmed = editedName.trim();
    if (!trimmed) {
      Alert.alert('エラー', '表示名を入力してください。');
      return;
    }
    if (trimmed === profile.displayName) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ display_name: trimmed })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, displayName: trimmed } : prev));
      setEditingName(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '表示名の更新に失敗しました。';
      Alert.alert('エラー', message);
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
      const message = logoutError instanceof Error ? logoutError.message : 'Failed to sign out.';
      Alert.alert('ログアウトに失敗しました', message);
    } finally {
      setSubmittingLogout(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.danger} />
        <Text style={styles.centerText}>{error ?? 'プロフィール取得に失敗しました'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>マイページ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar} style={styles.avatarWrapper}>
              <UserAvatar avatar={profile.avatar} size={64} backgroundColor="#A7F3D0" />
              <View style={styles.cameraOverlay}>
                {uploadingAvatar ? (
                  <ActivityIndicator size={12} color="#fff" />
                ) : (
                  <Ionicons name="camera" size={12} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
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
                  />
                  <TouchableOpacity onPress={handleSaveName} disabled={savingName} style={styles.saveNameButton}>
                    {savingName ? (
                      <ActivityIndicator size={14} color="#fff" />
                    ) : (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelEditName} style={styles.cancelNameButton}>
                    <Ionicons name="close" size={14} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameRow}>
                  <TouchableOpacity onPress={handleStartEditName} style={styles.nameTouchable}>
                    <Text style={styles.displayName}>{profile.displayName}</Text>
                    <Ionicons name="pencil" size={13} color={Colors.textMuted} style={styles.pencilIcon} />
                  </TouchableOpacity>
                  {profile.verified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" />
                      <Text style={styles.verifiedText}>認証済み</Text>
                    </View>
                  ) : null}
                </View>
              )}
              <Text style={styles.metaText}>{profile.email}</Text>
              <Text style={styles.metaText}>{profile.phone || '電話番号未設定'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>あなたの活動</Text>
          <View style={styles.statsRow}>
            <StatBox label="投稿" value={posts.length} color="#059669" bg="#ECFDF5" />
            <StatBox label="公開中" value={activePosts.length} color="#BE123C" bg="#FFF1F2" />
            <StatBox label="コメント" value={totalComments} color="#1D4ED8" bg="#EFF6FF" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>自分の投稿</Text>

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

          <View style={styles.postList}>
            {displayPosts.map((post) => (
              <View
                key={post.id}
                style={[styles.postItem, post.status === 'ended' && styles.postItemEnded]}
              >
                <CategoryBadge categoryId={post.category} size="sm" />
                <View style={styles.postBody}>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {post.title}
                  </Text>
                  <View style={styles.postMetaRow}>
                    <Text style={styles.postMeta}>{post.createdAt}</Text>
                    <View style={styles.metaStat}>
                      <Ionicons name="chatbubble-outline" size={11} color={Colors.textMuted} />
                      <Text style={styles.postMeta}>{post.comments}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            {displayPosts.length === 0 ? (
              <Text style={styles.emptyText}>表示する投稿がありません</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.logoutButton, submittingLogout && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={submittingLogout}
          >
            <Text style={styles.logoutText}>{submittingLogout ? 'ログアウト中...' : 'ログアウト'}</Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 24,
  },
  centerText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
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
  avatarWrapper: {
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  nameTouchable: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pencilIcon: { marginTop: 1 },
  editNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  saveNameButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelNameButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  metaText: { fontSize: 13, color: Colors.textSecondary },
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
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postMeta: { fontSize: 11, color: Colors.textMuted },
  metaStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', padding: 16 },
  logoutButton: {
    marginTop: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonDisabled: { opacity: 0.6 },
  logoutText: { fontSize: 13, fontWeight: '600', color: Colors.danger },
});
