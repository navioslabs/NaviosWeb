import { fetchPosts, mapPost, toRelativeTime } from '../../lib/postService';
import { supabase } from '../../lib/supabase';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('toRelativeTime', () => {
  it('returns たった今 for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(toRelativeTime(now)).toBe('たった今');
  });

  it('returns X分前 for minutes ago', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(toRelativeTime(tenMinAgo)).toBe('10分前');
  });

  it('returns X時間前 for hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(toRelativeTime(twoHoursAgo)).toBe('2時間前');
  });

  it('returns the original string for invalid dates', () => {
    expect(toRelativeTime('not a date')).toBe('not a date');
  });
});

describe('mapPost', () => {
  it('maps a valid row to Post', () => {
    const row = {
      id: 'post-1',
      category: 'stock',
      title: 'Test post',
      content: 'Content here',
      allow_comments: true,
      is_ended: false,
      created_at: new Date().toISOString(),
      expires_at: null,
      author_id: 'user-1',
      users: { id: 'user-1', display_name: 'Taro', avatar: 'T', verified: true, phone: null },
      places: { id: 'place-1', name: 'Shop', address: 'Tokyo', latitude: 35.6, longitude: 139.7 },
      post_details: null,
      post_images: [],
      comments: [],
    };

    const post = mapPost(row);
    expect(post).not.toBeNull();
    expect(post!.id).toBe('post-1');
    expect(post!.title).toBe('Test post');
    expect(post!.author.displayName).toBe('Taro');
    expect(post!.place.name).toBe('Shop');
    expect(post!.category).toBe('stock');
  });

  it('returns null for invalid category', () => {
    expect(mapPost({ category: 'invalid' })).toBeNull();
    expect(mapPost(null)).toBeNull();
  });

  it('sorts images by display_order', () => {
    const row = {
      id: 'post-2',
      category: 'event',
      title: 'Event',
      content: '',
      allow_comments: true,
      is_ended: false,
      created_at: new Date().toISOString(),
      users: { id: 'u1', display_name: 'A', avatar: 'A', verified: false },
      places: { id: 'p1', name: 'P', address: '', latitude: 0, longitude: 0 },
      post_details: null,
      post_images: [
        { image_url: 'img2.jpg', display_order: 2 },
        { image_url: 'img1.jpg', display_order: 1 },
      ],
      comments: [{ id: 'c1' }, { id: 'c2' }],
    };

    const post = mapPost(row);
    expect(post!.images).toEqual(['img1.jpg', 'img2.jpg']);
    expect(post!.commentCount).toBe(2);
  });
});

describe('fetchPosts', () => {
  it('builds correct query with default options', async () => {
    const mockData = [
      {
        id: 'p1',
        category: 'stock',
        title: 'Rice',
        content: '',
        allow_comments: true,
        is_ended: false,
        created_at: new Date().toISOString(),
        users: { id: 'u1', display_name: 'A', avatar: 'A', verified: false },
        places: { id: 'p1', name: 'Store', address: '', latitude: 0, longitude: 0 },
        post_details: null,
        post_images: [],
        comments: [],
      },
    ];

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    // The last chained call resolves with data
    mockQuery.eq.mockResolvedValue({ data: mockData, error: null });
    mockQuery.limit.mockReturnValue(mockQuery);
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    const posts = await fetchPosts();
    expect(supabase.from).toHaveBeenCalledWith('posts');
    expect(mockQuery.select).toHaveBeenCalled();
    expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(posts.length).toBe(1);
    expect(posts[0].title).toBe('Rice');
  });

  it('throws on Supabase error', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    await expect(fetchPosts()).rejects.toThrow('DB error');
  });
});
