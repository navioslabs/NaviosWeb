import type { Post, PostDetails, User, Place } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

type Category = Post['category'];

export type FetchPostsOptions = {
  category?: Category | 'all';
  includeEnded?: boolean;
  limit?: number;
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

export function toRelativeTime(value: string): string {
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

export function mapPost(row: any): Post | null {
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
