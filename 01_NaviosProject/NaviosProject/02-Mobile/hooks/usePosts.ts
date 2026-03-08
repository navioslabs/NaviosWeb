import { useMemo } from 'react';
import { MOCK_POSTS } from '../lib/mockData';

export function usePosts() {
  const posts = useMemo(() => MOCK_POSTS, []);
  return { posts, loading: false, error: null as string | null };
}
