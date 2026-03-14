import { useCallback, useEffect, useState } from 'react';
import type { Post } from '../types';
import { useLocation } from './useLocation';
import { fetchNearbyPostsByRpc, fetchPosts } from '../lib/postService';

type UseNearbyPostsOptions = {
  category?: Post['category'] | 'all';
  radiusMeters?: number;
};

export function useNearbyPosts(options: UseNearbyPostsOptions = {}) {
  const { category = 'all', radiusMeters = 5000 } = options;
  const { coords, loading: locationLoading, error: locationError } = useLocation();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      let data: Post[] = [];

      if (coords) {
        const [nearbyData, fallbackData] = await Promise.all([
          fetchNearbyPostsByRpc({
            latitude: coords.latitude,
            longitude: coords.longitude,
            radiusMeters,
            category,
          }),
          fetchPosts({
            category,
            includeEnded: false,
            limit: 50,
          }),
        ]);

        const nearbyIds = new Set(nearbyData.map((post) => post.id));
        const supplemental = fallbackData.filter((post) => !nearbyIds.has(post.id));
        data = [
          ...nearbyData,
          ...supplemental.map((post) => ({
            ...post,
            distance: post.distance > 0 ? post.distance : 999999,
          })),
        ];

        if (supplemental.length > 0) {
          setWarning('一部の投稿は距離情報が不完全なため、通常投稿として表示しています。');
        }
      } else {
        data = await fetchPosts({
          category,
          includeEnded: false,
          limit: 50,
        });

        if (locationError) {
          setWarning('位置情報を取得できないため、新着投稿を表示しています。');
        }
      }

      setPosts(data);
    } catch (fetchError) {
      try {
        const fallback = await fetchPosts({
          category,
          includeEnded: false,
          limit: 50,
        });
        setPosts(fallback);
        setWarning('近くの検索に失敗したため、新着投稿を表示しています。');
      } catch (fallbackError) {
        const message =
          fallbackError instanceof Error ? fallbackError.message : '近くの投稿取得に失敗しました。';
        setError(message);
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [category, coords, radiusMeters, locationError]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    posts,
    loading: locationLoading || loading,
    error,
    warning,
    coords,
    refetch,
  };
}
