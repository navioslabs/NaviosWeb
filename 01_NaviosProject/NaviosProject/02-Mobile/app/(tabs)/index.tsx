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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Post } from '../../types';
import { calcMatchScore } from '../../lib/utils';
import PostListItem from '../../components/post/PostListItem';
import { Colors } from '../../constants/colors';
import { usePosts } from '../../hooks/usePosts';

const QUICK_TAGS = ['水', '電気', '買い物', 'イベント', '子育て'];

const BOTTOM_INPUT_HEIGHT = 120;

function usePulseAnimation() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 900, useNativeDriver: true }),
        ]),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return { scale, opacity };
}

export default function PulseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(Post & { matchScore: number })[]>([]);
  const [searched, setSearched] = useState(false);
  const { scale, opacity } = usePulseAnimation();
  const { posts, loading: postLoading, error } = usePosts({ includeEnded: false, limit: 120 });

  const recommended = useMemo(() => [...posts].sort((a, b) => b.commentCount - a.commentCount).slice(0, 3), [posts]);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Main content area */}
      <View style={{ flex: 1, paddingBottom: BOTTOM_INPUT_HEIGHT }}>
        {postLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.teal} />
            <Text style={styles.loadingText}>投稿を読み込み中...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : null}

        {!error && loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.teal} />
            <Text style={styles.loadingText}>関連投稿を整理しています...</Text>
          </View>
        ) : null}

        {!error && searched && !loading && results.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="search" size={48} color={Colors.textMuted} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>関連する投稿が見つかりませんでした</Text>
            <Text style={styles.emptySubText}>別のキーワードで試してください</Text>
          </View>
        ) : null}

        {!error && searched && !loading && results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={<Text style={styles.resultHeader}>{results.length}件見つかりました</Text>}
            renderItem={({ item }) => (
              <PostListItem post={item} onPress={(post) => router.push(`/post/${post.id}`)} showMatchScore={item.matchScore} />
            )}
          />
        ) : null}

        {!error && !searched && !loading && !postLoading ? (
          <View style={styles.center}>
            <View style={styles.iconWrapper}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
              <View style={styles.aiIconBox}>
                <Ionicons name="flash" size={40} color="#fff" />
              </View>
            </View>

            <Text style={styles.emptyTitle}>NaviOs AIに相談してみる</Text>
            <Text style={styles.emptySubText}>気になる言葉を入れると、近くの投稿から候補を表示します。</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hintsScroll} contentContainerStyle={styles.hintsRow}>
              {recommended.map((item) => (
                <TouchableOpacity key={item.id} style={styles.hint} onPress={() => setQuery(item.title)} activeOpacity={0.7}>
                  <Text style={styles.hintText} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {/* Bottom floating search area */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.tagsRow}>
          {QUICK_TAGS.map((tag) => (
            <TouchableOpacity key={tag} style={styles.tag} onPress={() => setQuery(tag)} activeOpacity={0.7}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholder="例: 新鮮な野菜が買える場所"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tealLight,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.tealLight,
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.teal,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#CCFBF1',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.teal,
  },
  list: {
    padding: 16,
    paddingTop: 16,
  },
  separator: {
    height: 10,
  },
  resultHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
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
  emptyIcon: {
    marginBottom: 12,
  },
  iconWrapper: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 55,
    backgroundColor: 'rgba(13, 148, 136, 0.3)',
  },
  aiIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  hintsScroll: {
    marginTop: 20,
    maxHeight: 40,
  },
  hintsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  hint: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
