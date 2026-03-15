import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading, error } = useAuth();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    // ログイン済みユーザーがauth画面にいたらタブへ戻す
    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [loading, session, segments, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking auth state...</Text>
      </View>
    );
  }

  return (
    <>
      {Boolean(error) && !session ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Connection error: {error}</Text>
        </View>
      ) : null}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="post/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="post/create" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="post/success" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  banner: {
    backgroundColor: Colors.warningBannerBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerText: {
    fontSize: 12,
    color: Colors.warningText,
    textAlign: 'center',
  },
});
