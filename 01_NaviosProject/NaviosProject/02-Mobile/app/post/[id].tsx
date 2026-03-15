import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  Linking,
  Share,
  Animated,
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import UserAvatar from '../../components/common/UserAvatar';
import CategoryBadge from '../../components/common/CategoryBadge';
import CommentItem from '../../components/post/CommentItem';
import { formatDistance, getWalkTime } from '../../lib/utils';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import type { Comment, Post } from '../../types';
import {
  createComment,
  fetchCommentsByPostId,
  fetchPostById,
  toggleLike,
  checkUserLiked,
  endPost,
  deletePost,
} from '../../lib/postService';

const PAGE_SIZE = 5;
const CHAT_RADIUS_METERS = 500;

function getDistanceFromCoords(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const postId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const { coords: userCoords } = useLocation();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const load = async () => {
      if (!postId) {
        setError('Invalid post id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [postData, commentData] = await Promise.all([
          fetchPostById(postId),
          fetchCommentsByPostId(postId),
        ]);

        if (!postData) {
          setError('Post not found.');
          setPost(null);
          setComments([]);
          return;
        }

        setPost(postData);
        setComments(commentData);
        setLikeCount(postData.likeCount ?? 0);

        // Check if user has liked this post
        if (user) {
          const userLiked = await checkUserLiked(postId, user.id);
          setLiked(userLiked);
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load post.';
        setError(message);
        setPost(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [postId, user]);

  const displayedComments = useMemo(() => comments.slice(0, visibleCount), [comments, visibleCount]);
  const hasMoreComments = comments.length > visibleCount;

  const handleLoadMoreComments = useCallback(() => {
    if (!hasMoreComments || loadingMoreComments) return;
    setLoadingMoreComments(true);
    // Simulate a brief delay for UX smoothness
    setTimeout(() => {
      setVisibleCount((n) => n + PAGE_SIZE);
      setLoadingMoreComments(false);
    }, 300);
  }, [hasMoreComments, loadingMoreComments]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      if (distanceFromBottom < 200 && hasMoreComments && !loadingMoreComments) {
        handleLoadMoreComments();
      }
    },
    [hasMoreComments, loadingMoreComments, handleLoadMoreComments],
  );

  const handleNavigate = () => {
    if (!post) return;
    const { latitude, longitude } = post.place;
    if (!latitude || !longitude) {
      Alert.alert('場所情報がありません');
      return;
    }
    const url = `https://maps.google.com/?daddr=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleLike = async () => {
    if (!post || !postId) return;
    if (!user) {
      Alert.alert('ログインが必要です', 'いいねするにはログインしてください。');
      return;
    }
    if (likingInProgress) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));

    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    setLikingInProgress(true);
    try {
      const result = await toggleLike(postId, user.id);
      setLiked(result.liked);
      setLikeCount(result.count);
    } catch {
      // Revert optimistic update on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikingInProgress(false);
    }
  };

  const handleShare = () => {
    if (!post) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Share.share({
      title: post.title,
      message: `${post.title}\n${post.place.name} - ${post.place.address}`,
    }).catch(() => {});
  };

  const handleSendComment = async () => {
    if (!post || !postId) return;
    if (!post.allowComments) return;

    const content = commentText.trim();
    if (!content) return;

    if (!user) {
      Alert.alert('ログインが必要です', 'コメントするにはログインしてください。');
      return;
    }

    setSubmittingComment(true);
    try {
      const inserted = await createComment({
        postId,
        authorId: user.id,
        content,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setComments((prev) => [inserted, ...prev]);
      setCommentText('');
      setPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to send comment.';
      Alert.alert('コメント送信に失敗しました', message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePostMenu = () => {
    if (!post || !postId || !user) return;
    Alert.alert(
      '投稿の管理',
      undefined,
      [
        {
          text: '投稿を終了する',
          onPress: () => {
            Alert.alert(
              '投稿を終了しますか？',
              'この投稿は終了済みとして表示されます。',
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '終了する',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await endPost(postId);
                      setPost((prev) => (prev ? { ...prev, isEnded: true } : prev));
                      Alert.alert('投稿を終了しました');
                    } catch {
                      Alert.alert('エラー', '投稿の終了に失敗しました。');
                    }
                  },
                },
              ],
            );
          },
        },
        {
          text: '投稿を削除する',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '投稿を削除しますか？',
              'この操作は取り消せません。',
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除する',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deletePost(postId);
                      Alert.alert('投稿を削除しました');
                      router.back();
                    } catch {
                      Alert.alert('エラー', '投稿の削除に失敗しました。');
                    }
                  },
                },
              ],
            );
          },
        },
        { text: 'キャンセル', style: 'cancel' },
      ],
    );
  };

  const isOwnPost = post && user && post.author.id === user.id;

  const distanceToPost = post && userCoords
    ? getDistanceFromCoords(
        userCoords.latitude, userCoords.longitude,
        post.place.latitude, post.place.longitude,
      )
    : null;

  const isChatEnabled = isOwnPost || (distanceToPost !== null && distanceToPost <= CHAT_RADIUS_METERS);
  const remainingDistance = distanceToPost !== null ? Math.max(0, Math.round(distanceToPost - CHAT_RADIUS_METERS)) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.centerText}>読み込み中...</Text>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.danger} />
        <Text style={styles.centerText}>{error ?? '投稿が見つかりません'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <CategoryBadge categoryId={post.category} />
        <View style={styles.headerRight}>
          {isOwnPost ? (
            <TouchableOpacity style={styles.headerButton} onPress={handlePostMenu}>
              <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {post.images.length > 0 ? <Image source={{ uri: post.images[0] }} style={styles.image} /> : null}

        <View style={styles.body}>
          {post.isEnded ? (
            <View style={styles.endedBanner}>
              <Ionicons name="archive-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.endedBannerText}>この投稿は終了しました</Text>
            </View>
          ) : null}
          <Text style={styles.postTitle}>{post.title}</Text>
          <View style={styles.authorRow}>
            <UserAvatar avatar={post.author.avatar} size={32} />
            <View>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{post.author.displayName}</Text>
                {post.author.verified ? (
                  <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                ) : null}
              </View>
              <Text style={styles.time}>{post.createdAt}</Text>
            </View>
          </View>

          <View style={styles.engagementRow}>
            <TouchableOpacity
              style={styles.engagementBtn}
              onPress={handleLike}
              activeOpacity={0.7}
              disabled={likingInProgress}
            >
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                {likingInProgress ? (
                  <ActivityIndicator size="small" color={liked ? Colors.heart : Colors.textSecondary} />
                ) : (
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={liked ? Colors.heart : Colors.textSecondary}
                  />
                )}
              </Animated.View>
              <Text style={[styles.engagementCount, liked && styles.engagementCountLiked]}>{likeCount}</Text>
              <Text style={styles.engagementLabel}>いいね</Text>
            </TouchableOpacity>
            <View style={styles.engagementDivider} />
            <View style={styles.engagementBtn}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.engagementCount}>{post.commentCount}</Text>
              <Text style={styles.engagementLabel}>コメント</Text>
            </View>
            <View style={styles.engagementDivider} />
            <TouchableOpacity style={styles.engagementBtn} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.engagementLabel}>シェア</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.placeCard}>
            <View style={styles.placeIconBox}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{post.place.name}</Text>
              <Text style={styles.placeAddress}>{post.place.address}</Text>
            </View>
            <View style={styles.placeDistance}>
              <Text style={[styles.distanceText, { color: Colors.primary }]}>{formatDistance(post.distance)}</Text>
              <Text style={styles.walkText}>{getWalkTime(post.distance)}</Text>
            </View>
          </View>

          <Text style={styles.content}>{post.content}</Text>
          <InlineCategoryDetails post={post} />

          <View style={styles.commentsSection}>
            <View style={styles.commentsTitleRow}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.commentsTitle}>コメント ({comments.length})</Text>
            </View>
            <View style={styles.commentList}>
              {displayedComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </View>
            {loadingMoreComments ? (
              <View style={styles.loadMoreSpinner}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isChatEnabled ? (
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder={post.allowComments ? 'コメントを入力...' : 'コメントは無効です'}
              placeholderTextColor={Colors.textMuted}
              editable={post.allowComments && !submittingComment}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!post.allowComments || submittingComment || !commentText.trim()) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendComment}
              disabled={!post.allowComments || submittingComment || !commentText.trim()}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.chatLockedRow}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.chatLockedText}>
              {remainingDistance !== null
                ? `あと${formatDistance(remainingDistance)}でチャット可能`
                : '現在地を取得中...'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.navButton} onPress={handleNavigate}>
          <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
          <Text style={styles.navButtonText}>ここへ行く</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InlineCategoryDetails({ post }: { post: Post }) {
  const d = post.details;
  if (!d) return null;

  const Row = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View style={styles.inlineRow}>
        <Text style={styles.inlineLabel}>{label}</Text>
        <Text style={styles.inlineValue}>{value}</Text>
      </View>
    );
  };

  if (post.category === 'stock') {
    return (
      <View style={styles.inlineCard}>
        <Row label="価格" value={d.price} />
        <Row label="在庫状況" value={d.stockStatus} />
      </View>
    );
  }

  if (post.category === 'event') {
    return (
      <View style={styles.inlineCard}>
        <Row label="日時" value={`${d.eventDate ?? ''} ${d.eventTime ?? ''}`.trim()} />
        <Row label="参加費" value={d.fee} />
        {d.maxParticipants ? (
          <Row label="参加人数" value={`${d.currentParticipants ?? 0}/${d.maxParticipants}人`} />
        ) : null}
      </View>
    );
  }

  if (post.category === 'help') {
    return (
      <View style={styles.inlineCard}>
        <Row label="お礼" value={d.reward} />
        <Row label="目安時間" value={d.estimatedTime} />
      </View>
    );
  }

  if (post.category === 'admin') {
    return (
      <View style={styles.inlineCard}>
        <Row label="締切" value={d.deadline} />
        {d.requirements && d.requirements.length > 0 ? (
          <View style={styles.inlineRequirements}>
            <Text style={styles.inlineLabel}>必要なもの</Text>
            {d.requirements.map((req, i) => (
              <Text key={`${req}-${i}`} style={styles.inlineReqItem}>・{req}</Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.surface,
  },
  centerText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  backButton: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backButtonText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
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
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadMoreSpinner: { padding: 10, alignItems: 'center' },
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
  sendButtonDisabled: {
    opacity: 0.6,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  navButtonText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  chatLockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  chatLockedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  engagementBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  engagementDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  engagementCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  engagementCountLiked: {
    color: Colors.heart,
  },
  engagementLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inlineCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  inlineLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  inlineValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  inlineRequirements: {
    gap: 4,
  },
  inlineReqItem: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  endedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  endedBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
