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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CategoryId, getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { Post } from '../../types';
import CategoryFilter from '../../components/common/CategoryFilter';
import PostCard from '../../components/post/PostCard';
import PostListItem from '../../components/post/PostListItem';
import { Colors } from '../../constants/colors';
import { MOCK_POSTS } from '../../lib/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
type SheetState = 'closed' | 'half' | 'full';

/** ボトムシートの最大高さ */
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.62;

/** 各状態で translateY する量（sheet 高さ - 表示したい高さ） */
const SHEET_TRANSLATE: Record<SheetState, number> = {
  closed: MAX_SHEET_HEIGHT - 70,
  half:   MAX_SHEET_HEIGHT - 220,
  full:   0,
};

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

export default function NearbyScreen() {
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>(
    (initialCategory as CategoryId) ?? 'all'
  );
  const [sheetState, setSheetState] = useState<SheetState>('half');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // ─── ロゴ点滅アニメーション ───────────────────────────
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

  // ─── 現在地マーカーの ping アニメーション ────────────
  const pingScale   = useRef(new Animated.Value(1)).current;
  const pingOpacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const ping = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pingScale,   { toValue: 2.4, duration: 1400, useNativeDriver: true }),
          Animated.timing(pingOpacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pingScale,   { toValue: 1,   duration: 0, useNativeDriver: true }),
          Animated.timing(pingOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    ping.start();
    return () => ping.stop();
  }, [pingScale, pingOpacity]);

  // ─── ボトムシートの translateY アニメーション ─────────
  const sheetTranslateY = useRef(new Animated.Value(SHEET_TRANSLATE['half'])).current;

  /** シートの状態変更 + アニメーション */
  const animateSheet = (next: SheetState) => {
    setSheetState(next);
    Animated.timing(sheetTranslateY, {
      toValue: SHEET_TRANSLATE[next],
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const cycleSheet = () => {
    const next: SheetState =
      sheetState === 'closed' ? 'half' : sheetState === 'half' ? 'full' : 'half';
    animateSheet(next);
  };

  // ─── データ ─────────────────────────────────────────
  const filtered = activeCategory === 'all'
    ? MOCK_POSTS
    : MOCK_POSTS.filter((p) => p.category === activeCategory);
  const sorted   = [...filtered].sort((a, b) => a.distance - b.distance);
  const hotPosts = sorted.slice(0, 3);

  const categoryCount = Object.fromEntries(
    (['stock', 'event', 'help', 'admin'] as CategoryId[]).map((id) => [
      id,
      MOCK_POSTS.filter((p) => p.category === id).length,
    ])
  ) as Record<CategoryId, number>;

  return (
    <View style={styles.container}>
      {/* 地図エリア（プレースホルダー） */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️ 地図エリア</Text>
        <Text style={styles.mapSubText}>MapLibre を実装予定</Text>

        {/* 現在地マーカー */}
        <View style={styles.locationMarker}>
          <Animated.View style={[
            styles.locationPing,
            { transform: [{ scale: pingScale }], opacity: pingOpacity },
          ]} />
          <View style={styles.locationDot}>
            <Ionicons name="navigate" size={14} color="#fff" />
          </View>
        </View>

        {/* 投稿ピン */}
        {sorted.slice(0, PIN_POSITIONS.length).map((post, i) => {
          const cat      = getCategoryInfo(post.category);
          const iconName = getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap;
          const pos       = PIN_POSITIONS[i];
          const isSelected = selectedPost?.id === post.id;
          return (
            <TouchableOpacity
              key={post.id}
              style={[styles.pin, { top: pos.top, left: pos.left }]}
              onPress={() => {
                setSelectedPost(post);
                if (sheetState === 'closed') animateSheet('half');
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

      {/* ボトムシート（translateY アニメーション） */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
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
                        router.push(`/post/${p.id}`);
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
                  <PostListItem post={item} onPress={(p) => router.push(`/post/${p.id}`)} />
                )}
              />
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ─── 地図 ─────────────────────────────────────────────
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 32,
    marginBottom: 8,
  },
  mapSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // ─── 現在地マーカー ────────────────────────────────────
  locationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  locationDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  // ─── 投稿ピン ──────────────────────────────────────────
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
  // ─── ヘッダー ──────────────────────────────────────────
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
  // ─── ボトムシート ──────────────────────────────────────
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MAX_SHEET_HEIGHT,
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
