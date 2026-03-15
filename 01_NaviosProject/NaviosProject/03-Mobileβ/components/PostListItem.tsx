import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { getCategoryInfo, getCategoryIconName } from '../constants/categories';
import { formatDistance, getExpiryLabel } from '../lib/utils';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight, Spacing, Radius } from '../constants/design';
import UserAvatar from './UserAvatar';

type Props = {
  post: Post;
  onPress: (post: Post) => void;
};

export default function PostListItem({ post, onPress }: Props) {
  const cat = getCategoryInfo(post.category);
  const expiryLabel = getExpiryLabel(post);

  return (
    <TouchableOpacity style={[styles.container, post.isEnded && styles.containerEnded]} onPress={() => onPress(post)} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
        <Ionicons name={getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{post.title}</Text>
          {post.isEnded ? (
            <View style={styles.endedBadge}>
              <Text style={styles.endedBadgeText}>終了</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.meta}>
          <Text style={[styles.distance, { color: cat.color }]}>{formatDistance(post.distance)}</Text>
          <Text style={styles.dot}>・</Text>
          <UserAvatar avatar={post.author.avatar} size={16} />
          <Text style={styles.metaText}>{post.author.displayName}</Text>
          <Text style={styles.dot}>・</Text>
          <Text style={styles.metaText}>{post.createdAt}</Text>
          {expiryLabel ? (
            <>
              <Text style={styles.dot}>・</Text>
              <Ionicons name="time-outline" size={10} color={cat.color} />
              <Text style={[styles.metaText, { color: cat.color, fontWeight: '600' }]}>{expiryLabel}</Text>
            </>
          ) : null}
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
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'wrap',
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
  containerEnded: {
    opacity: 0.6,
  },
  endedBadge: {
    backgroundColor: Colors.textMuted,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  endedBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.surface,
  },
});
