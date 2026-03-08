/**
 * NearbyScreen - 近く（地図）画面
 * mock.jsx: view === 'main' の画面
 * 地図 + ボトムシート（ホットカード / 投稿リスト）
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CategoryId, getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import CategoryFilter from '../../components/common/CategoryFilter';
import PostCard from '../../components/post/PostCard';
import PostListItem from '../../components/post/PostListItem';
import { Post } from '../../types';
import { Colors } from '../../constants/colors';
import { MOCK_POSTS } from '../../lib/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
type SheetState = 'closed' | 'half' | 'full';

/** mock.jsx の pinPositions と同じ配置 */
const PIN_POSITIONS = [
  { top: '22%', left: '25%' },
  { top: '30%', left: '68%' },
  { top: '58%', left: '20%' },
  { top: '65%', left: '72%' },
  { top: '18%', left: '50%' },
  { top: '48%', left: '40%' },
  { top: '75%', left: '45%' },
  { top: '38%', left: '30%' },
] as const;

type Props = {
  onPostPress: (post: Post) => void;
};

export default function NearbyScreen({ onPostPress }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [sheetState, setSheetState] = useState<SheetState>('half');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const dotOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [dotOpacity]);

  const filtered = activeCategory === 'all'
    ? MOCK_POSTS
    : MOCK_POSTS.filter((p) => p.category === activeCategory);
  const sorted = [...filtered].sort((a, b) => a.distance - b.distance);
  const hotPosts = sorted.slice(0, 3);

  const categoryCount = Object.fromEntries(
    (['stock', 'event', 'help', 'admin'] as CategoryId[]).map((id) => [
      id,
      MOCK_POSTS.filter((p) => p.category === id).length,
    ])
  ) as Record<CategoryId, number>;

  const sheetHeight =
    sheetState === 'full' ? SCREEN_HEIGHT * 0.62
    : sheetState === 'half' ? 220
    : 70;

  const cycleSheet = () => {
    setSheetState((s) => s === 'closed' ? 'half' : s === 'half' ? 'full' : 'half');
  };

  return (
    <View style={styles.container}>
      {/* 地図エリア（プレースホルダー） */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️ 地図エリア</Text>
        <Text style={styles.mapSubText}>MapLibre を実装予定</Text>

        {/* 投稿ピン */}
        {sorted.slice(0, PIN_POSITIONS.length).map((post, i) => {
          const cat = getCategoryInfo(post.category);
          const iconName = getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap;
          const pos = PIN_POSITIONS[i];
          const isSelected = selectedPost?.id === post.id;
          return (
            <TouchableOpacity
              key={post.id}
              style={[styles.pin, { top: pos.top, left: pos.left }]}
              onPress={() => {
                setSelectedPost(post);
                if (sheetState === 'closed') setSheetState('half');
              }}
              activeOpacity={0.85}
            >
              <View style={[
                styles.pinCircle,
                { backgroundColor: cat.color },
                isSelected && styles.pinCircleSelected,
              ]}>
                <Ionicons name={iconName} size={16} color="#fff" />
              </View>
              {post.urgency === 'high' && (
                <View style={styles.pinUrgency}>
                  <Text style={styles.pinUrgencyText}>!</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ヘッダー */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
            <Text style={styles.logoText}>NaviOs</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.locationChip}>
              <Ionicons name="location-sharp" size={12} color={Colors.primary} />
              <Text style={styles.locationText}>伊集院</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellButton}>
              <Ionicons name="notifications" size={18} color={Colors.textPrimary} />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* カテゴリフィルター */}
        <CategoryFilter
          active={activeCategory}
          onSelect={setActiveCategory}
          counts={categoryCount}
        />
      </SafeAreaView>

      {/* ボトムシート */}
      <View style={[styles.sheet, { height: sheetHeight }]}>
        {/* ハンドル */}
        <TouchableOpacity style={styles.handleArea} onPress={cycleSheet}>
          <View style={styles.handle} />
        </TouchableOpacity>

        {sheetState === 'closed' ? (
          <View style={styles.closedRow}>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>近くの今</Text>
              <Text style={styles.countText}>{sorted.length}件</Text>
            </View>
            <Ionicons name="chevron-up" size={16} color={Colors.textMuted} />
          </View>
        ) : (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDotWhite} />
                <Text style={styles.liveBadgeText}>近くの今</Text>
              </View>
              <Text style={styles.countTextSub}>{sorted.length}件の情報</Text>
            </View>

            {/* ホットカード（横スクロール） */}
            <View style={styles.hotCardsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hotCards}
              >
                {hotPosts.map((post) => (
                  <View key={post.id} style={{ marginRight: 12 }}>
                    <PostCard
                      post={post}
                      isSelected={selectedPost?.id === post.id}
                      onPress={(p) => {
                        setSelectedPost(p);
                        onPostPress(p);
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 全リスト（full時のみ） */}
            {sheetState === 'full' && (
              <FlatList
                style={styles.fullList}
                data={sorted}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => (
                  <PostListItem post={item} onPress={onPostPress} />
                )}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    position: 'absolute',
    marginLeft: -18,
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinCircleSelected: {
    borderWidth: 3,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  pinUrgency: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinUrgencyText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
  },
  mapText: {
    fontSize: 32,
    marginBottom: 8,
  },
  mapSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    gap: 10,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bellButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  closedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  liveLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  countText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  liveDotWhite: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  countTextSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sheetContent: {
    flex: 1,
  },
  hotCardsWrapper: {
    height: 145,
    flexShrink: 0,
  },
  hotCards: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  fullList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
});
