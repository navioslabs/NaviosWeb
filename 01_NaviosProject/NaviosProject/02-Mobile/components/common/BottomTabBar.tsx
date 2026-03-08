/**
 * BottomTabBar - 全画面共通ボトムナビゲーション
 * mock.jsx の各画面に存在する <nav> 要素を共通化
 * アイコン: @expo/vector-icons (Ionicons) - Expo 同梱、追加インストール不要
 */
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export type TabName = 'pulse' | 'nearby' | 'search' | 'profile';

/** BottomTabBar の Props */
type Props = {
  /** 現在アクティブなタブ */
  activeTab: TabName;
  /** タブ押下時のコールバック */
  onTabPress: (tab: TabName) => void;
  /** 中央の投稿ボタン押下時のコールバック */
  onPostPress: () => void;
};

/** タブの定義（アイコンはアクティブ/非アクティブで使い分け） */
const TAB_ITEMS: {
  id: TabName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'pulse',   label: 'Pulse',    icon: 'flash-outline',      iconActive: 'flash' },
  { id: 'nearby',  label: '近く',     icon: 'map-outline',         iconActive: 'map' },
  { id: 'search',  label: '検索',     icon: 'search-outline',      iconActive: 'search' },
  { id: 'profile', label: 'マイページ', icon: 'person-outline',    iconActive: 'person' },
];

/**
 * アプリ全画面共通のボトムナビゲーションバー
 * 中央に投稿ボタン、左右にタブを配置
 */
export default function BottomTabBar({ activeTab, onTabPress, onPostPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TAB_ITEMS.slice(0, 2).map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onPress={() => onTabPress(tab.id)}
        />
      ))}

      {/* 投稿ボタン（中央） */}
      <TouchableOpacity style={styles.postButton} onPress={onPostPress} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {TAB_ITEMS.slice(2).map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onPress={() => onTabPress(tab.id)}
        />
      ))}
    </View>
  );
}

/** タブボタンの Props */
type TabButtonProps = {
  tab: (typeof TAB_ITEMS)[number];
  isActive: boolean;
  onPress: () => void;
};

/**
 * 個別タブボタン（アイコン + ラベル）
 */
function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const color = isActive ? Colors.primary : Colors.textMuted;
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={isActive ? tab.iconActive : tab.icon}
        size={22}
        color={color}
      />
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
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
