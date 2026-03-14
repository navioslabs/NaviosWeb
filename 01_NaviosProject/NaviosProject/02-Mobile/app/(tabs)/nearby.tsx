import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CATEGORIES, CategoryId, getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { Post } from '../../types';
import PostCard from '../../components/post/PostCard';
import PostListItem from '../../components/post/PostListItem';
import { Colors } from '../../constants/colors';
import { formatDistance } from '../../lib/utils';
import { useNearbyPosts } from '../../hooks/useNearbyPosts';
import { usePosts } from '../../hooks/usePosts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
type SheetState = 'closed' | 'half' | 'full';

const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.64;
const SHEET_TRANSLATE: Record<SheetState, number> = {
  closed: MAX_SHEET_HEIGHT - 70,
  half: MAX_SHEET_HEIGHT - 260,
  full: 0,
};

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
  const insets = useSafeAreaInsets();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>((initialCategory as CategoryId) ?? 'all');

  const { posts: allPosts } = usePosts();
  const { posts: sourcePosts, loading: postsLoading, error: postsError, warning: postsWarning } = useNearbyPosts({
    category: activeCategory,
  });

  const [sheetState, setSheetState] = useState<SheetState>('half');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Floating preview card animation
  const FLOAT_CARD_HEIGHT = 120;
  const floatTranslateY = useRef(new Animated.Value(FLOAT_CARD_HEIGHT + 20)).current;
  const floatVisible = useRef(false);

  const showFloatingCard = useCallback((post: Post) => {
    if (floatVisible.current && selectedPost?.id !== post.id) {
      // Slide out, swap, slide in
      Animated.timing(floatTranslateY, {
        toValue: FLOAT_CARD_HEIGHT + 20,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setSelectedPost(post);
        Animated.spring(floatTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      });
    } else if (!floatVisible.current) {
      setSelectedPost(post);
      floatVisible.current = true;
      Animated.spring(floatTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [selectedPost, floatTranslateY]);

  const hideFloatingCard = useCallback(() => {
    Animated.timing(floatTranslateY, {
      toValue: FLOAT_CARD_HEIGHT + 20,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      floatVisible.current = false;
      setSelectedPost(null);
    });
  }, [floatTranslateY]);

  const dotOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, [dotOpacity]);

  const pingScale = useRef(new Animated.Value(1)).current;
  const pingOpacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const ping = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pingScale, { toValue: 2.4, duration: 1400, useNativeDriver: true }),
          Animated.timing(pingOpacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pingScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pingOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    ping.start();
    return () => ping.stop();
  }, [pingScale, pingOpacity]);

  const sheetTranslateY = useRef(new Animated.Value(SHEET_TRANSLATE.half)).current;

  const animateSheet = (next: SheetState) => {
    setSheetState(next);
    Animated.timing(sheetTranslateY, {
      toValue: SHEET_TRANSLATE[next],
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const cycleSheet = () => {
    const next: SheetState = sheetState === 'closed' ? 'half' : sheetState === 'half' ? 'full' : 'half';
    animateSheet(next);
  };

  const sorted = useMemo(() => {
    const filtered = activeCategory === 'all' ? sourcePosts : sourcePosts.filter((p) => p.category === activeCategory);
    return [...filtered].sort((a, b) => a.distance - b.distance);
  }, [activeCategory, sourcePosts]);

  const hotPosts = sorted.slice(0, 3);

  const categoryCount = useMemo(
    () =>
      Object.fromEntries(
        (['stock', 'event', 'help', 'admin'] as CategoryId[]).map((id) => [
          id,
          allPosts.filter((p) => p.category === id).length,
        ]),
      ) as Record<CategoryId, number>,
    [allPosts],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mapPlaceholder}
        activeOpacity={1}
        onPress={() => { if (floatVisible.current) hideFloatingCard(); }}
      >
        <Text style={styles.mapText}>近くの投稿マップ</Text>
        <Text style={styles.mapSubText}>MapLibre 本実装前のプレースホルダーです</Text>

        <View style={styles.locationMarker}>
          <Animated.View
            style={[styles.locationPing, { transform: [{ scale: pingScale }], opacity: pingOpacity }]}
          />
          <View style={styles.locationDot}>
            <Ionicons name="navigate" size={14} color="#fff" />
          </View>
        </View>

        {sorted.slice(0, PIN_POSITIONS.length).map((post, i) => {
          const cat = getCategoryInfo(post.category);
          const iconName = getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap;
          const pos = PIN_POSITIONS[i];
          const isSelected = selectedPost?.id === post.id;

          return (
            <TouchableOpacity
              key={post.id}
              style={[styles.pin, { top: pos.top, left: pos.left }]}
              onPress={() => showFloatingCard(post)}
              activeOpacity={0.85}
            >
              <View style={[styles.pinCircle, { backgroundColor: cat.color }, isSelected && styles.pinCircleSelected]}>
                <Ionicons name={iconName} size={16} color="#fff" />
              </View>
              {post.urgency === 'high' ? (
                <View style={styles.pinUrgency}>
                  <Text style={styles.pinUrgencyText}>!</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </TouchableOpacity>

      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
            <Text style={styles.logoText}>NaviOs</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.locationChip}>
              <Ionicons name="location-sharp" size={12} color={Colors.primary} />
              <Text style={styles.locationText}>現在地</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellButton}>
              <Ionicons name="notifications" size={18} color={Colors.textPrimary} />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          <CategoryChip label="すべて" active={activeCategory === 'all'} color="#475569" onPress={() => setActiveCategory('all')} />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={`${cat.label} ${categoryCount[cat.id] ?? 0}`}
              active={activeCategory === cat.id}
              color={cat.color}
              onPress={() => setActiveCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <TouchableOpacity style={styles.handleArea} onPress={cycleSheet}>
          <View style={styles.handle} />
        </TouchableOpacity>

        {sheetState === 'closed' ? (
          <View style={styles.closedRow}>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>近くの投稿</Text>
              <Text style={styles.countText}>{postsLoading ? '読み込み中...' : `${sorted.length}件`}</Text>
            </View>
            <Ionicons name="chevron-up" size={16} color={Colors.textMuted} />
          </View>
        ) : (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDotWhite} />
                <Text style={styles.liveBadgeText}>近くの投稿</Text>
              </View>
              <Text style={styles.countTextSub}>{postsLoading ? '読み込み中' : `${sorted.length}件を表示中`}</Text>
            </View>

            {postsError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
                <Text style={styles.errorText}>{postsError}</Text>
              </View>
            ) : null}

            {postsWarning ? (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={14} color={Colors.warning} />
                <Text style={styles.warningText}>{postsWarning}</Text>
              </View>
            ) : null}

            <View style={styles.hotCardsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hotCards}>
                {hotPosts.map((post) => (
                  <View key={post.id} style={styles.hotCardItem}>
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

            {sheetState === 'full' ? (
              <FlatList
                style={styles.fullList}
                data={sorted}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 86 }]}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => <PostListItem post={item} onPress={(p) => router.push(`/post/${p.id}`)} />}
              />
            ) : null}
          </View>
        )}
      </Animated.View>

      {/* Floating preview card — slides up when a pin is selected */}
      {selectedPost ? (
        <Animated.View
          style={[
            styles.floatingCard,
            { bottom: MAX_SHEET_HEIGHT - SHEET_TRANSLATE[sheetState] + 12, transform: [{ translateY: floatTranslateY }] },
          ]}
        >
          {(() => {
            const cat = getCategoryInfo(selectedPost.category);
            const iconName = getCategoryIconName(selectedPost.category) as keyof typeof Ionicons.glyphMap;
            return (
              <TouchableOpacity
                style={styles.floatingCardInner}
                activeOpacity={0.9}
                onPress={() => router.push(`/post/${selectedPost.id}`)}
              >
                <View style={[styles.floatingCardAccent, { backgroundColor: cat.color }]} />
                <View style={styles.floatingCardBody}>
                  <View style={styles.floatingCardHeader}>
                    <View style={[styles.floatingCatIcon, { backgroundColor: cat.color }]}>
                      <Ionicons name={iconName} size={14} color="#fff" />
                    </View>
                    <Text style={[styles.floatingCatLabel, { color: cat.color }]}>{cat.label}</Text>
                    {selectedPost.urgency === 'high' ? <Text style={styles.floatingUrgency}>急ぎ</Text> : null}
                    <TouchableOpacity onPress={hideFloatingCard} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }} style={styles.floatingClose}>
                      <Ionicons name="close" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.floatingTitle} numberOfLines={2}>{selectedPost.title}</Text>
                  <View style={styles.floatingFooter}>
                    <View style={styles.floatingFooterLeft}>
                      <Ionicons name="location-outline" size={11} color={Colors.textSecondary} />
                      <Text style={styles.floatingPlace} numberOfLines={1}>{selectedPost.place.name}</Text>
                    </View>
                    <Text style={[styles.floatingDist, { color: cat.color }]}>{formatDistance(selectedPost.distance)}</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })()}
        </Animated.View>
      ) : null}
    </View>
  );
}

function CategoryChip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.categoryChip, active ? { backgroundColor: color } : styles.categoryChipInactive]}
      activeOpacity={0.75}
    >
      <Text style={[styles.categoryChipLabel, active && styles.categoryChipLabelActive]}>{label}</Text>
    </TouchableOpacity>
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
  mapText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
  },
  mapSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
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
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryChipInactive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  categoryChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipLabelActive: {
    color: '#fff',
  },
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
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
  },
  warningBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  sheetContent: {
    flex: 1,
  },
  hotCardsWrapper: {
    height: 184,
    flexShrink: 0,
  },
  hotCards: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  hotCardItem: {
    marginRight: 12,
  },
  fullList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  floatingCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
  },
  floatingCardInner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCardAccent: {
    width: 5,
  },
  floatingCardBody: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  floatingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingCatIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCatLabel: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  floatingUrgency: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
  },
  floatingClose: {
    padding: 2,
  },
  floatingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  floatingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  floatingPlace: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  floatingDist: {
    fontSize: 11,
    fontWeight: '700',
  },
});
