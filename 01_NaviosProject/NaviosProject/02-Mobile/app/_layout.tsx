/**
 * RootLayout - アプリ全体のルートレイアウト
 * Expo Router の Stack ナビゲーターを使用
 * Tabs グループ / 投稿詳細 / 投稿作成 / 認証画面を管理する
 */
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

/**
 * ルートレイアウト
 * SafeAreaProvider を最上位に配置し、Stack で画面を管理する
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="post/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="post/create" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
