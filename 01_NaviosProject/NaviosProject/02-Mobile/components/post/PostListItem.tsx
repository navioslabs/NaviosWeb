/**
 * PostListItem - 投稿一覧の行アイテム
 * mock.jsx: ボトムシート全展開時のリスト、検索結果リスト
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import { getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { formatDistance, getExpiryLabel } from '../../lib/utils';
import { Colors } from '../../constants/colors';

type Props = {
  post: Post;
  onPress: (post: Post) => void;
  showMatchScore?: number; // Pulse検索結果用
};

export default function PostListItem({ post, onPress, showMatchScore }: Props) {
  const cat = getCategoryInfo(post.category);
  const expiryLabel = getExpiryLabel(post);

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(post)} activeOpacity={0.7}>
      {/* カテゴリアイコン */}
      <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
        <Ionicons name={getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
      </View>

      {/* テキスト */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{post.title}</Text>
          {showMatchScore !== undefined && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{showMatchScore}%</Text>
            </View>
          )}
        </View>
        {showMatchScore !== undefined && (
          <Text style={styles.content} numberOfLines={2}>{post.content}</Text>
        )}
        <View style={styles.meta}>
          <Text style={[styles.distance, { color: cat.color }]}>{formatDistance(post.distance)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{post.author.displayName}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{post.createdAt}</Text>
          {expiryLabel && (
            <>
              <Text style={styles.dot}>·</Text>
              <Ionicons name="time-outline" size={10} color={cat.color} />
              <Text style={[styles.metaText, { color: cat.color, fontWeight: '600' }]}>{expiryLabel}</Text>
            </>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  content: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  scoreBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  distance: {
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
