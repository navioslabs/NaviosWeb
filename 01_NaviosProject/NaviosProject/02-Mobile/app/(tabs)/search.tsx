import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CATEGORIES, CategoryId, getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import PostListItem from '../../components/post/PostListItem';
import { PostListSkeleton } from '../../components/common/SkeletonLoader';
import { usePosts } from '../../hooks/usePosts';
import type { Post } from '../../types';

type FilterTab = 'now' | 'hot' | 'ended';

const FILTER_TABS: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'now', label: '最新', icon: 'radio-outline' },
  { key: 'hot', label: '盛り上がり', icon: 'flame-outline' },
  { key: 'ended', label: '過去の人気', icon: 'archive-outline' },
];

export default function TimelineScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('now');
  const { posts, loading, error, refetch } = usePosts({ includeEnded: true, limit: 120 });
  const [refreshing, setRefreshing] = useState(false);

  // Active (not ended) posts
  const activePosts = useMemo(() => posts.filter((p) => !p.isEnded), [posts]);

  // Sections for each tab
  const sections = useMemo(() => {
    if (activeTab === 'now') {
      // Group by category, newest first within each
      const grouped = CATEGORIES.map((cat) => {
        const items = activePosts
          .filter((p) => p.category === cat.id)
          .slice(0, 5);
        return { cat, items };
      }).filter((g) => g.items.length > 0);

      return grouped.map((g) => ({
        key: g.cat.id,
        title: g.cat.label,
        icon: getCategoryIconName(g.cat.id) as keyof typeof Ionicons.glyphMap,
        color: g.cat.color,
        count: activePosts.filter((p) => p.category === g.cat.id).length,
        data: g.items,
      }));
    }

    if (activeTab === 'hot') {
      // Top posts by engagement (comments + likes), active only
      const hotPosts = [...activePosts]
        .sort((a, b) => {
          const scoreA = a.commentCount * 3 + (a.likeCount ?? 0) * 2;
          const scoreB = b.commentCount * 3 + (b.likeCount ?? 0) * 2;
          return scoreB - scoreA;
        })
        .slice(0, 15);

      if (hotPosts.length === 0) return [];
      return [{
        key: 'hot',
        title: '今盛り上がっている投稿',
        icon: 'flame' as keyof typeof Ionicons.glyphMap,
        color: Colors.warning,
        count: hotPosts.length,
        data: hotPosts,
      }];
    }

    // ended tab
    const endedPosts = posts
      .filter((p) => p.isEnded)
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 20);

    if (endedPosts.length === 0) return [];
    return [{
      key: 'ended',
      title: '過去に盛り上がった投稿',
      icon: 'trophy-outline' as keyof typeof Ionicons.glyphMap,
      color: Colors.purple,
      count: endedPosts.length,
      data: endedPosts,
    }];
  }, [activeTab, activePosts, posts]);

  // Summary stats
  const stats = useMemo(() => ({
    total: activePosts.length,
    categories: CATEGORIES.map((cat) => ({
      ...cat,
      count: activePosts.filter((p) => p.category === cat.id).length,
    })),
  }), [activePosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostListItem post={item} onPress={(p) => router.push(`/post/${p.id}`)} />
    ),
    [router],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; icon: keyof typeof Ionicons.glyphMap; color: string; count: number } }) => (
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBox, { backgroundColor: section.color }]}>
          <Ionicons name={section.icon} size={14} color="#fff" />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{section.count}</Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with warm gradient feel */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="newspaper-outline" size={18} color="#fff" />
            </View>
            <Text style={styles.title}>タイムライン</Text>
          </View>
          <Text style={styles.headerSub}>まちの最新情報</Text>
        </View>

        {/* Mini stats bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {stats.categories.map((cat) => (
            <View key={cat.id} style={styles.statChip}>
              <View style={[styles.statDot, { backgroundColor: cat.color }]} />
              <Text style={styles.statLabel}>{cat.label}</Text>
              <Text style={[styles.statCount, { color: cat.color }]}>{cat.count}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabBar}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? Colors.orange : Colors.textMuted}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive ? <View style={styles.tabIndicator} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <PostListSkeleton count={5} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
          stickySectionHeadersEnabled={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name={activeTab === 'ended' ? 'archive-outline' : 'document-text-outline'}
                size={40}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'ended' ? '終了した投稿はまだありません' : '投稿がありません'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'ended' ? '過去の人気投稿がここに表示されます' : '新しい投稿を待っています'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.orangeWarm },
  header: {
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.orangeBorder,
    gap: 10,
  },
  headerTop: {
    gap: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.orangeDark },
  headerSub: { fontSize: 11, color: Colors.orangeText, marginLeft: 38 },
  statsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.orangeBorder,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  statCount: { fontSize: 12, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
    position: 'relative',
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.orange,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.orange,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.orangeBorder,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.orange,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: { fontSize: 13, color: Colors.textSecondary },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.dangerBg,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.dangerText },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyText: { fontSize: 13, color: Colors.textMuted },
});
