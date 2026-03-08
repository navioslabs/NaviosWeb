/**
 * App.tsx - ルートナビゲーター
 * mock.jsx の view ステートによる画面切り替えを再現
 * React Navigation 導入後は Stack + Bottom Tabs に移行予定
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import BottomTabBar, { TabName } from './components/common/BottomTabBar';
import PulseScreen from './app/(tabs)/index';
import NearbyScreen from './app/(tabs)/nearby';
import SearchScreen from './app/(tabs)/search';
import ProfileScreen from './app/(tabs)/profile';
import DetailScreen from './app/post/[id]';
import CreatePostScreen from './app/post/create';
import { Post } from './types';
import { CategoryId } from './constants/categories';

type ViewName = TabName | 'detail' | 'post';

export default function App() {
  const [view, setView] = useState<ViewName>('pulse');
  const [activeTab, setActiveTab] = useState<TabName>('pulse');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    setView(tab);
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setView('detail');
  };

  const handleCategorySelect = (id: CategoryId) => {
    setActiveTab('nearby');
    setView('nearby');
    // TODO: NearbyScreen に category を渡してフィルター適用
  };

  const showTabBar = view !== 'detail' && view !== 'post';

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* メインコンテンツ */}
        <View style={styles.content}>
          {view === 'pulse' && <PulseScreen onPostPress={handlePostPress} />}
          {view === 'nearby' && <NearbyScreen onPostPress={handlePostPress} />}
          {view === 'search' && <SearchScreen onCategorySelect={handleCategorySelect} onPostPress={handlePostPress} />}
          {view === 'profile' && <ProfileScreen />}
          {view === 'detail' && selectedPost && (
            <DetailScreen post={selectedPost} onBack={() => setView(activeTab)} />
          )}
          {view === 'post' && (
            <CreatePostScreen onClose={() => setView(activeTab)} />
          )}
        </View>

        {/* ボトムナビ */}
        {showTabBar && (
          <BottomTabBar
            activeTab={activeTab}
            onTabPress={handleTabPress}
            onPostPress={() => setView('post')}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
