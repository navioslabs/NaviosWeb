/**
 * PulseScreen - Pulse（ホーム）画面
 * mock.jsx: view === 'pulse' の画面
 * AI風キーワード検索 → 投稿マッチング表示
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import { calcMatchScore } from '../../lib/utils';
import PostListItem from '../../components/post/PostListItem';
import { Colors } from '../../constants/colors';

// TODO: 実APIに差し替え
import { MOCK_POSTS } from '../../lib/mockData';

const QUICK_TAGS = ['野菜', '卵', '手伝い', 'イベント', '給付金'];

/** PulseScreen の Props */
type Props = {
  /** 投稿カードタップ時のコールバック */
  onPostPress: (post: Post) => void;
};

/**
 * 中央アイコンのパルスアニメーションを管理するフック
 * @returns アニメーション値（scale, opacity）
 */
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
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return { scale, opacity };
}

/**
 * Pulse（ホーム）画面
 * NaviOs AI へのキーワード検索と投稿マッチング結果を表示する
 */
export default function PulseScreen({ onPostPress }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(Post & { matchScore: number })[]>([]);
  const [searched, setSearched] = useState(false);
  const { scale, opacity } = usePulseAnimation();

  /** キーワード検索を実行してスコアリング */
  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    // モック: 1秒遅延でスコアリング
    setTimeout(() => {
      const scored = MOCK_POSTS
        .map((p) => ({ ...p, matchScore: calcMatchScore(p, query) }))
        .filter((p) => p.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
      setResults(scored);
      setLoading(false);
      setSearched(true);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Ionicons name="flash" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>NaviOs AI</Text>
            <Text style={styles.subtitle}>近くの情報をAIがキャッチ</Text>
          </View>
        </View>
      </View>

      {/* 検索入力 */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="NaviOs AIに聞いてみる..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* クイックタグ */}
      <View style={styles.tagsRow}>
        {QUICK_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.tag}
            onPress={() => setQuery(tag)}
            activeOpacity={0.7}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* コンテンツ: ローディング中 */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>近くの情報を探しています...</Text>
        </View>
      )}

      {/* コンテンツ: 検索結果なし */}
      {searched && !loading && results.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="search" size={48} color={Colors.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>該当する情報が見つかりませんでした</Text>
          <Text style={styles.emptySubText}>別のキーワードで試してみてください</Text>
        </View>
      )}

      {/* コンテンツ: 検索結果あり */}
      {searched && !loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <Text style={styles.resultHeader}>{results.length}件見つかりました ✨</Text>
          }
          renderItem={({ item }) => (
            <PostListItem
              post={item}
              onPress={onPostPress}
              showMatchScore={item.matchScore}
            />
          )}
        />
      )}

      {/* コンテンツ: 初期状態（中央パルスアイコン） */}
      {!searched && !loading && (
        <View style={styles.center}>
          {/* パルスエフェクト: 固定サイズコンテナでリングをabsoluteFill */}
          <View style={styles.iconWrapper}>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
            <View style={styles.aiIconBox}>
              <Ionicons name="flash" size={40} color="#fff" />
            </View>
          </View>

          <Text style={styles.emptyTitle}>NaviOs AIに聞いてみよう</Text>
          <Text style={styles.emptySubText}>
            あなたの言葉で探してみてください。{'\n'}AIが近くの最適な情報を見つけます。
          </Text>
          <View style={styles.hintsRow}>
            {['新鮮な卵が欲しい', '今日のイベント', '誰か手伝って'].map((hint) => (
              <TouchableOpacity
                key={hint}
                style={styles.hint}
                onPress={() => setQuery(hint)}
                activeOpacity={0.7}
              >
                <Text style={styles.hintText}>"{hint}"</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  list: {
    padding: 16,
    paddingTop: 0,
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
  // 中央パルスアイコン
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
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
  },
  aiIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
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
  hintsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
    justifyContent: 'center',
  },
  hint: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
