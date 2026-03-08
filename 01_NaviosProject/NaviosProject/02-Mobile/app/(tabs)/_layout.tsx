/**
 * TabsLayout - ボトムタブナビゲーションのレイアウト
 * Expo Router の Tabs を使用し、カスタムタブバーで中央の投稿ボタンを実現
 */
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/colors';

/** タブ定義（インデックス順 = state.index と対応） */
const TAB_ITEMS = [
  { name: 'index',   label: 'Pulse',    icon: 'flash-outline'  as const, iconActive: 'flash'   as const },
  { name: 'nearby',  label: '近く',     icon: 'map-outline'    as const, iconActive: 'map'     as const },
  { name: 'search',  label: '検索',     icon: 'search-outline' as const, iconActive: 'search'  as const },
  { name: 'profile', label: 'マイページ', icon: 'person-outline' as const, iconActive: 'person' as const },
] as const;

/**
 * カスタムタブバー
 * 左2タブ / 中央投稿ボタン / 右2タブ の5分割レイアウト
 */
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* 左側: Pulse・近く */}
      {TAB_ITEMS.slice(0, 2).map((tab, i) => (
        <TabButton
          key={tab.name}
          label={tab.label}
          icon={tab.icon}
          iconActive={tab.iconActive}
          isActive={state.index === i}
          onPress={() => navigation.navigate(tab.name as never)}
        />
      ))}

      {/* 投稿ボタン（中央） */}
      <TouchableOpacity
        style={styles.postButton}
        onPress={() => router.push('/post/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* 右側: 検索・マイページ */}
      {TAB_ITEMS.slice(2).map((tab, i) => (
        <TabButton
          key={tab.name}
          label={tab.label}
          icon={tab.icon}
          iconActive={tab.iconActive}
          isActive={state.index === i + 2}
          onPress={() => navigation.navigate(tab.name as never)}
        />
      ))}
    </View>
  );
}

/** タブボタン Props */
type TabButtonProps = {
  /** ラベルテキスト */
  label: string;
  /** 非アクティブアイコン名 */
  icon: keyof typeof Ionicons.glyphMap;
  /** アクティブアイコン名 */
  iconActive: keyof typeof Ionicons.glyphMap;
  /** アクティブ状態 */
  isActive: boolean;
  /** タップ時のコールバック */
  onPress: () => void;
};

/**
 * 個別タブボタン（アイコン + ラベル）
 */
function TabButton({ label, icon, iconActive, isActive, onPress }: TabButtonProps) {
  const color = isActive ? Colors.primary : Colors.textMuted;
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={isActive ? iconActive : icon} size={22} color={color} />
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * タブナビゲーションのルートレイアウト
 * 4画面を管理し、カスタムタブバーを使用する
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="nearby" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
