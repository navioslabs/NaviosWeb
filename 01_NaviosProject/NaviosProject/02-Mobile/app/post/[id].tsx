/**
 * DetailScreen - 投稿詳細画面
 * mock.jsx: view === 'detail' の画面
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import UserAvatar from '../../components/common/UserAvatar';
import CategoryBadge from '../../components/common/CategoryBadge';
import CategoryDetailCard from '../../components/post/CategoryDetailCard';
import CommentItem from '../../components/post/CommentItem';
import { formatDistance, getWalkTime } from '../../lib/utils';
import { CATEGORY_ACTIONS } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { MOCK_COMMENTS } from '../../lib/mockData';

type Props = {
  post: Post;
  onBack: () => void;
};

const PAGE_SIZE = 3;

export default function DetailScreen({ post, onBack }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [commentText, setCommentText] = useState('');
  const comments = MOCK_COMMENTS.slice(0, visibleCount);
  const remaining = MOCK_COMMENTS.length - visibleCount;
  const action = CATEGORY_ACTIONS[post.category];

  const handleNavigate = () => {
    const { latitude, longitude } = post.place;
    const url = `https://maps.google.com/?daddr=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleActionPress = () => {
    if (post.category === 'stock' && post.author.phone) {
      Linking.openURL(`tel:${post.author.phone}`).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <CategoryBadge categoryId={post.category} />
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-social-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 画像 */}
        {post.images.length > 0 && (
          <Image source={{ uri: post.images[0] }} style={styles.image} />
        )}

        <View style={styles.body}>
          {/* タイトル・投稿者 */}
          <Text style={styles.postTitle}>{post.title}</Text>
          <View style={styles.authorRow}>
            <UserAvatar avatar={post.author.avatar} size={32} />
            <View>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{post.author.displayName}</Text>
                {post.author.verified && (
                  <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.time}>{post.createdAt}</Text>
            </View>
          </View>

          {/* 場所情報 */}
          <View style={styles.placeCard}>
            <View style={styles.placeIconBox}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{post.place.name}</Text>
              <Text style={styles.placeAddress}>{post.place.address}</Text>
            </View>
            <View style={styles.placeDistance}>
              <Text style={[styles.distanceText, { color: Colors.primary }]}>
                {formatDistance(post.distance)}
              </Text>
              <Text style={styles.walkText}>{getWalkTime(post.distance)}</Text>
            </View>
          </View>

          {/* 本文 */}
          <Text style={styles.content}>{post.content}</Text>

          {/* カテゴリ別詳細 */}
          <CategoryDetailCard post={post} />

          {/* コメント */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsTitleRow}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.commentsTitle}>コメント ({MOCK_COMMENTS.length})</Text>
            </View>
            <View style={styles.commentList}>
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </View>
            {remaining > 0 && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                <Text style={styles.loadMoreText}>もっと見る（残り{remaining}件）</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* コメント入力 + アクションボタン */}
      <View style={styles.footer}>
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="コメントを入力..."
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.navButton} onPress={handleNavigate}>
            <Ionicons name="navigate-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.navButtonText}>ここへ行く</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={handleActionPress}
          >
            <Text style={styles.actionButtonText}>{action.label}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  image: { width: '100%', height: 192, resizeMode: 'cover' },
  body: { padding: 16, gap: 16 },
  postTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, lineHeight: 30 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  time: { fontSize: 12, color: Colors.textSecondary },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  placeIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  placeAddress: { fontSize: 12, color: Colors.textSecondary },
  placeDistance: { alignItems: 'flex-end' },
  distanceText: { fontSize: 14, fontWeight: '700' },
  walkText: { fontSize: 11, color: Colors.textSecondary },
  content: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
  commentsSection: { gap: 12 },
  commentsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentsTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  commentList: { gap: 12 },
  loadMoreButton: { padding: 10, alignItems: 'center' },
  loadMoreText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  footer: {
    padding: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  navButtonText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  actionButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
