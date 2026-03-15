import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type ProfileData = {
  displayName: string;
  avatar: string;
  verified: boolean;
  email: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingLogout, setSubmittingLogout] = useState(false);

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
        const { data: profileRow, error: profileError } = await supabase
          .from('users')
          .select('display_name, avatar, verified, email')
          .eq('id', user.id)
          .maybeSingle();
        if (profileError) throw profileError;

        const avatarValue = profileRow?.avatar ?? '';
        const displayName = profileRow?.display_name ?? user.email?.split('@')[0] ?? 'User';

        setProfile({
          displayName,
          avatar: avatarValue.startsWith('http')
            ? avatarValue
            : (displayName.charAt(0) || 'U').toUpperCase(),
          verified: Boolean(profileRow?.verified),
          email: profileRow?.email ?? user.email ?? '',
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'プロフィール取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

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
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
        <View style={styles.heroSection}>
          <View style={styles.heroBg} />
          <View style={styles.heroContent}>
            <UserAvatar avatar={profile.avatar} size={80} backgroundColor={Colors.avatarGreen} />
            <Text style={styles.heroName}>{profile.displayName}</Text>
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

        <View style={styles.body}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: Colors.textSecondary }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  guestContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  guestContent: { alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  guestIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  guestTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  guestSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  guestLoginBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  guestLoginBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.surface, padding: 24 },
  errorText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  heroSection: { position: 'relative', alignItems: 'center', paddingBottom: 20 },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 130, backgroundColor: Colors.primary, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroContent: { alignItems: 'center', paddingTop: 40, gap: 8 },
  heroName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  heroBadges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  verifiedChipText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  heroEmail: { fontSize: 12, color: Colors.textSecondary },
  body: { padding: 16, gap: 16, paddingBottom: 32 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  menuList: { backgroundColor: Colors.surface, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 14 },
  menuLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  menuValue: { flex: 1, fontSize: 13, color: Colors.textPrimary, textAlign: 'right', fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, backgroundColor: Colors.dangerBg, borderRadius: 12, borderWidth: 1, borderColor: Colors.dangerBorder },
  logoutText: { fontSize: 14, fontWeight: '600', color: Colors.dangerDark },
});
