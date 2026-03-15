import { useCallback, useEffect, useState } from 'react';
import type { Post } from '../types';
import { fetchPosts as fetchPostsFromApi } from '../lib/postService';

type UsePostsOptions = {
  category?: Post['category'] | 'all';
  includeEnded?: boolean;
  limit?: number;
};

export function usePosts(options: UsePostsOptions = {}) {
  const { category = 'all', includeEnded = false, limit = 50 } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPostsFromApi({ category, includeEnded, limit });
      setPosts(data);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : '投稿の取得に失敗しました。';
      setError(message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [category, includeEnded, limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}
