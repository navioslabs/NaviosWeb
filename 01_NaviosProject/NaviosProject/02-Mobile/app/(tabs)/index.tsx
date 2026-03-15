import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Post } from '../../types';
import { calcMatchScore } from '../../lib/utils';
import PostListItem from '../../components/post/PostListItem';
import { Colors } from '../../constants/colors';
import { usePosts } from '../../hooks/usePosts';
import { CATEGORIES, getCategoryIconName } from '../../constants/categories';

function usePulseAnimation() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.3, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 1.5, duration: 1400, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0.3, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    pulse.start();
    pulse2.start();
    return () => { pulse.stop(); pulse2.stop(); };
  }, [scale, opacity, ring2Scale, ring2Opacity]);

  return { scale, opacity, ring2Scale, ring2Opacity };
}

function useFloatAnimation() {
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -6, duration: 2000, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    );
    float.start();
    return () => float.stop();
  }, [translateY]);
  return translateY;
}

export default function PulseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(Post & { matchScore: number })[]>([]);
  const [searched, setSearched] = useState(false);
  const { scale, opacity, ring2Scale, ring2Opacity } = usePulseAnimation();
  const floatY = useFloatAnimation();
  const { posts, loading: postLoading, error } = usePosts({ includeEnded: false, limit: 120 });

  const recommended = useMemo(() => [...posts].sort((a, b) => b.commentCount - a.commentCount).slice(0, 5), [posts]);

  const handleSearch = () => {
    if (!query.trim() || postLoading) return;
    setLoading(true);
    setSearched(false);
    setTimeout(() => {
      const scored = posts
        .map((p) => ({ ...p, matchScore: calcMatchScore(p, query) }))
        .filter((p) => p.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
      setResults(scored);
      setLoading(false);
      setSearched(true);
    }, 550);
  };

  const handleClearSearch = () => {
    setSearched(false);
    setResults([]);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      {/* Background layers */}
      <View style={styles.bgLayer1} />
      <View style={styles.bgLayer2} />
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerDot} />
            <Text style={styles.headerTitle}>Pulse</Text>
          </View>
          <Text style={styles.headerSub}>AI検索</Text>
        </View>

        {/* Loading states */}
        {postLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.teal} />
            <Text style={styles.loadingText}>投稿を読み込み中...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : null}

        {!error && loading ? (
          <View style={styles.center}>
            <View style={styles.searchingAnim}>
              <ActivityIndicator size="large" color={Colors.teal} />
              <Ionicons name="sparkles" size={20} color={Colors.teal} style={{ marginTop: 8 }} />
            </View>
            <Text style={styles.searchingText}>AIが関連投稿を探しています...</Text>
          </View>
        ) : null}

        {!error && searched && !loading && results.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.noResultIcon}>
              <Ionicons name="search" size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.noResultTitle}>見つかりませんでした</Text>
            <Text style={styles.emptySubText}>別のキーワードで試してください</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleClearSearch} activeOpacity={0.7}>
              <Text style={styles.retryBtnText}>検索をやり直す</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Results */}
        {!error && searched && !loading && results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              <View style={styles.resultHeaderRow}>
                <View style={styles.resultHeaderBadge}>
                  <Ionicons name="sparkles" size={14} color={Colors.teal} />
                  <Text style={styles.resultHeaderText}>{results.length}件の関連投稿</Text>
                </View>
                <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <PostListItem post={item} onPress={(post) => router.push(`/post/${post.id}`)} showMatchScore={item.matchScore} />
            )}
          />
        ) : null}

        {/* Initial hero state */}
        {!error && !searched && !loading && !postLoading ? (
          <ScrollView
            contentContainerStyle={styles.heroScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* AI Icon with pulse rings */}
            <Animated.View style={[styles.heroIconArea, { transform: [{ translateY: floatY }] }]}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
              <Animated.View style={[styles.pulseRing2, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />
              <View style={styles.aiIconOuter}>
                <View style={styles.aiIconBox}>
                  <Ionicons name="flash" size={36} color="#fff" />
                </View>
              </View>
            </Animated.View>

            <Text style={styles.heroTitle}>NaviOs AIに聞いてみよう</Text>
            <Text style={styles.heroSub}>
              キーワードを入力すると、近くの投稿からAIが最適な情報を見つけます
            </Text>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <View style={styles.inputWrap}>
                <Ionicons name="search-outline" size={18} color={Colors.teal} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleSearch}
                  placeholder="何をお探しですか？"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="search"
                />
                {query.length > 0 ? (
                  <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
                <Ionicons name="arrow-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Category chips */}
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => {
                const iconName = getCategoryIconName(cat.id) as keyof typeof Ionicons.glyphMap;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, { borderColor: cat.color }]}
                    onPress={() => setQuery(cat.label)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryChipIcon, { backgroundColor: cat.bgColor }]}>
                      <Ionicons name={iconName} size={16} color={cat.color} />
                    </View>
                    <Text style={[styles.categoryChipText, { color: cat.color }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Trending section */}
            {recommended.length > 0 ? (
              <View style={styles.trendingSection}>
                <View style={styles.trendingHeader}>
                  <Ionicons name="trending-up" size={18} color={Colors.teal} />
                  <Text style={styles.trendingTitle}>トレンド</Text>
                </View>
                <View style={styles.trendingList}>
                  {recommended.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.trendingItem}
                      onPress={() => setQuery(item.title)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.trendingRank}>{idx + 1}</Text>
                      <Text style={styles.trendingText} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.trendingMeta}>
                        <Ionicons name="chatbubble-outline" size={10} color={Colors.textMuted} />
                        <Text style={styles.trendingMetaText}>{item.commentCount}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

          </ScrollView>
        ) : null}

        {/* Bottom bar — results mode */}
        {searched ? (
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.searchBox}>
              <View style={styles.inputWrap}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleSearch}
                  placeholder="何をお探しですか？"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
                <Ionicons name="arrow-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDFA',
  },
  // Decorative background orbs
  bgLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#E0F7F5',
    borderBottomRightRadius: 60,
  },
  bgLayer2: {
    position: 'absolute',
    top: '30%',
    right: 0,
    width: '60%',
    height: '20%',
    backgroundColor: 'rgba(13, 148, 136, 0.04)',
    borderTopLeftRadius: 80,
    borderBottomLeftRadius: 80,
  },
  bgOrb1: {
    position: 'absolute',
    top: 80,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(13, 148, 136, 0.06)',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 160,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(13, 148, 136, 0.04)',
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.teal,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.teal,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Hero scroll
  heroScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroIconArea: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  pulseRing2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  aiIconOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  searchButton: {
    width: 52,
    height: 52,
    backgroundColor: Colors.teal,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  categoryChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },

  // Trending
  trendingSection: {
    marginBottom: 24,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trendingList: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(13, 148, 136, 0.08)',
    gap: 10,
  },
  trendingRank: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.teal,
    width: 22,
    textAlign: 'center',
  },
  trendingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendingMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  // Bottom bar
  bottomBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13, 148, 136, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },

  // Result list
  list: {
    padding: 16,
    paddingTop: 8,
  },
  separator: {
    height: 10,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resultHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.teal,
  },

  // Shared
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchingAnim: {
    alignItems: 'center',
    marginBottom: 16,
  },
  searchingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.teal,
  },
  noResultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(13, 148, 136, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noResultTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderRadius: 20,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.teal,
  },
});
