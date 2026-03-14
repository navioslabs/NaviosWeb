import * as ImageManipulator from 'expo-image-manipulator';
import type { Comment, Post, PostFormData, PostDetails, User, Place } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

type Category = Post['category'];

export type FetchPostsOptions = {
  category?: Category | 'all';
  includeEnded?: boolean;
  limit?: number;
};

export type NearbyPostsOptions = {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  category?: Category | 'all';
};

export type CreatePostOptions = {
  form: PostFormData;
  userId: string;
  coords?: { latitude: number; longitude: number } | null;
};

const VALID_CATEGORIES: Category[] = ['stock', 'event', 'help', 'admin'];

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase env is missing.');
  }
}

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return date.toLocaleString();

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'たった今';
  if (diffMinutes < 60) return `${diffMinutes}分前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString();
}

function mapPostDetails(row: any): PostDetails | undefined {
  const details = pickOne(row?.post_details);
  if (!details) return undefined;

  const mapped: PostDetails = {};

  if (details.price) mapped.price = details.price;
  if (details.stock_status) mapped.stockStatus = details.stock_status as PostDetails['stockStatus'];
  if (details.stock_duration) mapped.stockDuration = details.stock_duration as PostDetails['stockDuration'];
  if (details.event_date) mapped.eventDate = details.event_date;
  if (details.event_time) mapped.eventTime = details.event_time;
  if (details.fee) mapped.fee = details.fee;
  if (typeof details.max_participants === 'number') mapped.maxParticipants = details.max_participants;
  if (typeof details.current_participants === 'number') mapped.currentParticipants = details.current_participants;
  if (details.help_type) mapped.helpType = details.help_type as PostDetails['helpType'];
  if (details.reward) mapped.reward = details.reward;
  if (details.estimated_time) mapped.estimatedTime = details.estimated_time;
  if (details.deadline) mapped.deadline = details.deadline;
  if (Array.isArray(details.requirements)) mapped.requirements = details.requirements;

  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

function mapPost(row: any): Post | null {
  if (!VALID_CATEGORIES.includes(row?.category as Category)) {
    return null;
  }

  const authorFromJoin = pickOne(row?.users);
  const author: User = {
    id: authorFromJoin?.id ?? row?.author_id ?? 'unknown',
    displayName: authorFromJoin?.display_name ?? 'Unknown user',
    avatar: authorFromJoin?.avatar ?? 'U',
    verified: Boolean(authorFromJoin?.verified),
    phone: authorFromJoin?.phone ?? null,
  };

  const placeFromJoin = pickOne(row?.places);
  const place: Place = {
    id: placeFromJoin?.id ?? undefined,
    name: placeFromJoin?.name ?? 'Unknown place',
    address: placeFromJoin?.address ?? '',
    latitude: placeFromJoin?.latitude ?? 0,
    longitude: placeFromJoin?.longitude ?? 0,
  };

  const images = (row?.post_images ?? [])
    .slice()
    .sort((a: any, b: any) => (a?.display_order ?? 0) - (b?.display_order ?? 0))
    .map((image: any) => image?.image_url)
    .filter(Boolean) as string[];

  return {
    id: row.id,
    category: row.category as Category,
    title: row.title ?? '',
    content: row.content ?? '',
    author,
    place,
    distance: 0,
    images,
    details: mapPostDetails(row),
    urgency: 'medium',
    allowComments: row.allow_comments ?? true,
    isEnded: row.is_ended ?? false,
    commentCount: Array.isArray(row?.comments) ? row.comments.length : 0,
    likeCount: 0,
    createdAt: toRelativeTime(row.created_at),
    expiresAt: row.expires_at ?? undefined,
  };
}

function mapComment(row: any): Comment | null {
  if (!row?.id) return null;

  const authorFromJoin = pickOne(row.users);
  const author: User = {
    id: authorFromJoin?.id ?? row.author_id ?? 'unknown',
    displayName: authorFromJoin?.display_name ?? 'Unknown user',
    avatar: authorFromJoin?.avatar ?? 'U',
    verified: Boolean(authorFromJoin?.verified),
    phone: authorFromJoin?.phone ?? null,
  };

  return {
    id: row.id,
    author,
    content: row.content ?? '',
    canHelp: Boolean(row.can_help),
    createdAt: toRelativeTime(row.created_at),
  };
}

function detailsPayload(form: PostFormData) {
  const payload: Record<string, unknown> = {
    price: form.price?.trim() || null,
    stock_status: form.stockStatus || null,
    stock_duration: form.stockDuration || null,
    event_date: form.eventDate?.trim() || null,
    event_time: form.eventTime?.trim() || null,
    fee: form.fee?.trim() || null,
    max_participants: typeof form.maxParticipants === 'number' ? form.maxParticipants : null,
    help_type: form.helpType || null,
    reward: form.reward?.trim() || null,
    estimated_time: form.estimatedTime?.trim() || null,
    deadline: form.deadline?.trim() || null,
    requirements: Array.isArray(form.requirements)
      ? form.requirements.map((item) => item.trim()).filter(Boolean)
      : null,
  };

  const hasValue = Object.values(payload).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== '';
  });

  return hasValue ? payload : null;
}

function calculateExpiresAt(form: PostFormData): string | null {
  const now = new Date();

  if (form.category === 'stock') {
    const mapHours: Record<string, number> = {
      today: 24,
      '48hours': 48,
      '3days': 72,
      '1week': 168,
    };
    const hours = mapHours[form.stockDuration ?? ''] ?? 48;
    return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
  }

  if (form.category === 'help') {
    return new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
  }

  if (form.category === 'admin' && form.deadline?.trim()) {
    const deadline = new Date(form.deadline.trim());
    if (!Number.isNaN(deadline.getTime())) return deadline.toISOString();
  }

  if (form.category === 'event' && form.eventDate?.trim()) {
    const eventText = `${form.eventDate.trim()} ${form.eventTime?.trim() || '23:59'}`.trim();
    const eventAt = new Date(eventText);
    if (!Number.isNaN(eventAt.getTime())) return eventAt.toISOString();
  }

  return null;
}

function getPostSelect() {
  return `
    id,
    category,
    title,
    content,
    allow_comments,
    is_ended,
    created_at,
    expires_at,
    author_id,
    location,
    users:users!posts_author_id_fkey(id, display_name, avatar, verified, phone),
    places:places!posts_place_id_fkey(id, name, address, latitude, longitude),
    post_details(price, stock_status, stock_duration, event_date, event_time, fee, max_participants, current_participants, help_type, reward, estimated_time, deadline, requirements),
    post_images(image_url, display_order),
    comments(id)
  `;
}

function getFileExtension(uri: string) {
  const matched = uri.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
  const ext = matched?.[1] ?? 'jpg';
  if (ext === 'jpeg') return 'jpg';
  return ext;
}

export async function optimizeImage(
  uri: string,
  maxSize: number = 800,
  quality: number = 0.7,
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxSize } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

async function uploadPostImage(params: {
  postId: string;
  userId: string;
  imageUri: string;
  displayOrder: number;
}) {
  const { postId, userId, imageUri, displayOrder } = params;
  const optimizedUri = await optimizeImage(imageUri, 800, 0.7);
  const ext = getFileExtension(optimizedUri);
  const filePath = `${userId}/${postId}/${Date.now()}-${displayOrder}.${ext}`;

  const response = await fetch(optimizedUri);
  if (!response.ok) {
    throw new Error(`Failed to read image data (${response.status}).`);
  }

  const fileData = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, fileData, {
      contentType: `image/${ext}`,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage.from('images').getPublicUrl(filePath);
  const imageUrl = publicData.publicUrl;
  if (!imageUrl) throw new Error('Failed to create image URL.');

  const { error: imageRowError } = await supabase.from('post_images').insert({
    post_id: postId,
    image_url: imageUrl,
    display_order: displayOrder,
  });

  if (imageRowError) throw imageRowError;
}

export async function fetchPosts(options: FetchPostsOptions = {}) {
  ensureConfigured();
  const { category = 'all', includeEnded = false, limit = 50 } = options;

  let query = supabase
    .from('posts')
    .select(getPostSelect())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!includeEnded) query = query.eq('is_ended', false);
  if (category !== 'all') query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as any[]).map(mapPost).filter((post): post is Post => post !== null);
}

export async function fetchPostsByIds(ids: string[]) {
  ensureConfigured();
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(getPostSelect())
    .in('id', ids);

  if (error) throw error;

  const mapped = ((data ?? []) as any[]).map(mapPost).filter((post): post is Post => post !== null);
  const orderMap = new Map(ids.map((id, index) => [id, index]));
  return mapped.sort((a, b) => (orderMap.get(a.id) ?? 9999) - (orderMap.get(b.id) ?? 9999));
}

export async function fetchNearbyPostsByRpc(options: NearbyPostsOptions) {
  ensureConfigured();
  const { latitude, longitude, radiusMeters = 5000, category = 'all' } = options;

  const { data, error } = await supabase.rpc('get_nearby_posts', {
    user_lat: latitude,
    user_lng: longitude,
    radius_meters: radiusMeters,
    category_filter: category === 'all' ? null : category,
  });

  if (error) throw error;

  const rpcRows = (data ?? []) as Array<{ id: string; distance_meters?: number | null }>;
  const orderedIds = rpcRows.map((row) => row.id);
  const posts = await fetchPostsByIds(orderedIds);
  const distanceMap = new Map<string, number>(
    rpcRows.map((row) => [row.id, typeof row.distance_meters === 'number' ? row.distance_meters : 0]),
  );

  return posts.map((post) => ({ ...post, distance: distanceMap.get(post.id) ?? post.distance }));
}

export async function fetchPostById(postId: string) {
  const posts = await fetchPostsByIds([postId]);
  return posts[0] ?? null;
}

export async function fetchCommentsByPostId(postId: string) {
  ensureConfigured();

  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      id,
      post_id,
      author_id,
      content,
      can_help,
      created_at,
      users:users!comments_author_id_fkey(id, display_name, avatar, verified, phone)
    `,
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as any[]).map(mapComment).filter((comment): comment is Comment => comment !== null);
}

export async function createComment(options: {
  postId: string;
  authorId: string;
  content: string;
  canHelp?: boolean;
}) {
  ensureConfigured();
  const { postId, authorId, content, canHelp = false } = options;

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      content: content.trim(),
      can_help: canHelp,
    })
    .select(
      `
      id,
      post_id,
      author_id,
      content,
      can_help,
      created_at,
      users:users!comments_author_id_fkey(id, display_name, avatar, verified, phone)
    `,
    )
    .single();

  if (error) throw error;

  const mapped = mapComment(data);
  if (!mapped) throw new Error('Failed to map inserted comment.');
  return mapped;
}

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
  ensureConfigured();
  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  }

  const { count } = await supabase
    .from('post_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  return { liked: !existing, count: count ?? 0 };
}

export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
  ensureConfigured();
  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function endPost(postId: string) {
  ensureConfigured();
  const { error } = await supabase.from('posts').update({ is_ended: true }).eq('id', postId);
  if (error) throw error;
}

export async function deletePost(postId: string) {
  ensureConfigured();
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function createPost(options: CreatePostOptions) {
  ensureConfigured();
  const { form, userId, coords } = options;

  const title = form.title.trim();
  if (!title) {
    throw new Error('Title is required.');
  }

  let placeId: string | null = null;
  let latitude = coords?.latitude ?? null;
  let longitude = coords?.longitude ?? null;

  if (form.place) {
    const placePayload = {
      name: form.place.name || 'Pinned place',
      address: form.place.address || null,
      latitude: form.place.latitude,
      longitude: form.place.longitude,
      source: 'user',
      category: form.category,
    };
    const { data: insertedPlace, error: placeError } = await supabase
      .from('places')
      .insert(placePayload)
      .select('id, latitude, longitude')
      .single();
    if (placeError) throw placeError;
    placeId = insertedPlace.id;
    latitude = insertedPlace.latitude;
    longitude = insertedPlace.longitude;
  } else if (typeof latitude === 'number' && typeof longitude === 'number') {
    const { data: insertedPlace, error: placeError } = await supabase
      .from('places')
      .insert({
        name: 'Current location',
        address: null,
        latitude,
        longitude,
        source: 'user',
        category: form.category,
      })
      .select('id, latitude, longitude')
      .single();
    if (!placeError && insertedPlace) {
      placeId = insertedPlace.id;
      latitude = insertedPlace.latitude;
      longitude = insertedPlace.longitude;
    }
  }

  const location =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? `SRID=4326;POINT(${longitude} ${latitude})`
      : null;

  const expiresAt = calculateExpiresAt(form);

  const { data: insertedPost, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: userId,
      category: form.category,
      title,
      content: form.content?.trim() || null,
      place_id: placeId,
      location,
      allow_comments: form.allowComments,
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (postError) throw postError;

  const details = detailsPayload(form);
  if (details) {
    const { error: detailsError } = await supabase.from('post_details').insert({
      post_id: insertedPost.id,
      ...details,
    });
    if (detailsError) throw detailsError;
  }

  if (Array.isArray(form.images) && form.images.length > 0) {
    for (let index = 0; index < form.images.length; index += 1) {
      const imageUri = form.images[index];
      if (!imageUri) continue;
      await uploadPostImage({
        postId: insertedPost.id,
        userId,
        imageUri,
        displayOrder: index,
      });
    }
  }

  return insertedPost.id as string;
}
