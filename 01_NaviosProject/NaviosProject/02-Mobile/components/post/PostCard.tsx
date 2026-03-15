import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import { getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { formatDistance, getExpiryLabel } from '../../lib/utils';
import { Colors } from '../../constants/colors';
import { Spacing, Radius, FontSize, FontWeight } from '../../constants/design';
import UserAvatar from '../common/UserAvatar';

export const CARD_WIDTH = Math.floor(Dimensions.get('window').width * 0.42);

type Props = {
  post: Post;
  isSelected?: boolean;
  onPress: (post: Post) => void;
};

export default function PostCard({ post, isSelected, onPress }: Props) {
  const cat = getCategoryInfo(post.category);
  const iconName = getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap;
  const expiryLabel = getExpiryLabel(post);

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected, post.isEnded && styles.cardEnded, { borderColor: isSelected ? cat.color : Colors.border }]}
      onPress={() => onPress(post)}
      activeOpacity={0.82}
    >
      <View style={styles.header}>
        <View style={[styles.categoryIconBox, { backgroundColor: cat.color }]}>
          <Ionicons name={iconName} size={13} color="#fff" />
        </View>
        {post.urgency === 'high' ? <Text style={styles.urgencyBadge}>急ぎ</Text> : null}
        {post.isEnded ? <Text style={styles.endedBadge}>終了</Text> : null}
        {post.author.verified ? <Ionicons name="checkmark-circle" size={14} color={Colors.blue} /> : null}
        <View style={styles.headerSpacer} />
        <UserAvatar avatar={post.author.avatar} size={20} />
      </View>

      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{post.title}</Text>

      {expiryLabel ? (
        <View style={styles.expiryRow}>
          <Ionicons name="time-outline" size={10} color={cat.color} />
          <Text style={[styles.expiryText, { color: cat.color }]} numberOfLines={1}>{expiryLabel}</Text>
        </View>
      ) : null}

      <View style={styles.placeRow}>
        <Ionicons name="location-outline" size={10} color={Colors.textSecondary} />
        <Text style={styles.placeName} numberOfLines={1}>{post.place.name}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.distance, { color: cat.color }]}>{formatDistance(post.distance)}</Text>
        <Text style={styles.time} numberOfLines={1}>{post.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: 162,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    justifyContent: 'space-between',
  },
  cardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  categoryIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  urgencyBadge: {
    fontSize: 10,
    color: Colors.danger,
    fontWeight: '700',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 17,
    minHeight: 34,
    marginBottom: 6,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  placeName: {
    fontSize: 10,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    gap: 8,
  },
  distance: {
    fontSize: 10,
    fontWeight: '700',
  },
  time: {
    fontSize: 10,
    color: Colors.textMuted,
    flexShrink: 1,
    textAlign: 'right',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
    minHeight: 14,
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  cardEnded: {
    opacity: 0.6,
  },
  endedBadge: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.surface,
    backgroundColor: Colors.textMuted,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
});
