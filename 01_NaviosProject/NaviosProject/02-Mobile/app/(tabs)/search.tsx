/**
 * SearchScreen - 検索画面
 * mock.jsx: view === 'search' の画面
 * キーワード検索 / トレンド / 過去の盛り上がり / カテゴリから探す
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CATEGORIES, CategoryId, getCategoryIconName, getCategoryInfo } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { TrendingPost, PastHotPost } from '../../types';
import { MOCK_TRENDING, MOCK_PAST_HOT, MOCK_POSTS } from '../../lib/mockData';
import { calcMatchScore } from '../../lib/utils';
import PostListItem from '../../components/post/PostListItem';

type SectionProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const isSearching = query.trim().length > 0;

  const results = isSearching
    ? MOCK_POSTS
        .map((p) => ({
          post: p,
          score: calcMatchScore(
            { title: p.title, content: p.content, category: p.category, distance: p.distance, urgency: p.urgency },
            query
          ),
        }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
    : [];

  /** カテゴリに一致するMOCK_POSTを探してdetailへ */
  const handleTrendPress = (category: string) => {
    const matched = MOCK_POSTS.find((p) => p.category === category) ?? MOCK_POSTS[0];
    router.push(`/post/${matched.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>検索</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="キーワードで検索..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* 検索結果 */}
        {isSearching && (
          <View style={styles.section}>
            <Text style={styles.resultsHeader}>
              {results.length > 0 ? `${results.length}件の検索結果` : 'キーワードに一致する投稿が見つかりません'}
            </Text>
            {results.map(({ post, score }) => (
              <PostListItem key={post.id} post={post} onPress={(p) => router.push(`/post/${p.id}`)} showMatchScore={score} />
            ))}
          </View>
        )}

        {/* 通常セクション（検索していないとき） */}
        {!isSearching && (
          <>
            <Section iconName="flame" iconColor="#EF4444" iconBg="#FEE2E2" title="今日のトレンド">
              {MOCK_TRENDING.map((post) => (
                <TrendItem key={post.id} post={post} onPress={() => handleTrendPress(post.category)} />
              ))}
            </Section>

            <Section iconName="time-outline" iconColor="#7C3AED" iconBg="#EDE9FE" title="過去の盛り上がり">
              {MOCK_PAST_HOT.map((post) => (
                <PastHotItem key={post.id} post={post} onPress={() => handleTrendPress(post.category)} />
              ))}
            </Section>

            <Section iconName="grid-outline" iconColor="#059669" iconBg="#D1FAE5" title="カテゴリから探す">
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const count = MOCK_POSTS.filter((p) => p.category === cat.id).length;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryCard, { backgroundColor: cat.color }]}
                      onPress={() => router.push({ pathname: '/(tabs)/nearby', params: { category: cat.id } })}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={getCategoryIconName(cat.id) as keyof typeof Ionicons.glyphMap}
                        size={28}
                        color="#fff"
                        style={styles.categoryIcon}
                      />
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                      <Text style={styles.categoryCount}>{count}件の投稿</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ iconName, iconColor, iconBg, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function TrendItem({ post, onPress }: { post: TrendingPost; onPress: () => void }) {
  const cat = getCategoryInfo(post.category as CategoryId);
  return (
    <TouchableOpacity style={styles.trendItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.trendIconBox, { backgroundColor: cat.color }]}>
        <Ionicons name={getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
      </View>
      <View style={styles.trendBody}>
        <Text style={styles.trendTitle} numberOfLines={1}>{post.title}</Text>
        <Text style={styles.trendMeta}>{post.spotName} · {post.time}</Text>
      </View>
      <View style={styles.trendStats}>
        <View style={styles.statRow}>
          <Ionicons name="flame" size={12} color="#EF4444" />
          <Text style={styles.trendLike}>{post.likes}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="chatbubble-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.trendComment}>{post.comments}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

function PastHotItem({ post, onPress }: { post: PastHotPost; onPress: () => void }) {
  const cat = getCategoryInfo(post.category as CategoryId);
  return (
    <TouchableOpacity style={styles.trendItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.trendIconBox, { backgroundColor: cat.color }]}>
        <Ionicons name={getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
      </View>
      <View style={styles.trendBody}>
        <Text style={styles.trendTitle} numberOfLines={1}>{post.title}</Text>
        <Text style={styles.trendMeta}>{post.spotName} · {post.time}</Text>
      </View>
      <View style={styles.trendStats}>
        <View style={styles.statRow}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.trendStar}>{post.likes}</Text>
        </View>
        {post.participants && (
          <View style={styles.statRow}>
            <Ionicons name="person-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.trendComment}>{post.participants}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, height: 44, fontSize: 14, color: Colors.textPrimary },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  resultsHeader: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trendIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trendBody: { flex: 1, gap: 2 },
  trendTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  trendMeta: { fontSize: 11, color: Colors.textSecondary },
  trendStats: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendLike: { fontSize: 11, color: '#EF4444', fontWeight: '600' },
  trendStar: { fontSize: 11, color: '#F59E0B', fontWeight: '600' },
  trendComment: { fontSize: 11, color: Colors.textMuted },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '47%', borderRadius: 12, padding: 16, gap: 4 },
  categoryIcon: { marginBottom: 4 },
  categoryLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  categoryCount: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
});
