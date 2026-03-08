import { CategoryId } from '../constants/categories';

// ユーザー
export type User = {
  id: string;
  displayName: string;
  avatar: string;       // 1文字のアバター文字
  verified: boolean;
  phone?: string | null;
  bio?: string;
  location?: string;
  stats?: {
    posts: number;
    helped: number;
    comments: number;
  };
};

// 場所
export type Place = {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

// カテゴリ別詳細データ
export type PostDetails = {
  // stock
  price?: string;
  stockStatus?: '在庫あり' | '残りわずか' | '入荷予定';
  stockDuration?: 'today' | '48hours' | '3days' | '1week' | 'manual';
  // event
  eventDate?: string;
  eventTime?: string;
  fee?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  // help
  helpType?: 'request' | 'share';
  reward?: string;
  estimatedTime?: string;
  // admin
  deadline?: string;
  requirements?: string[];
};

// 投稿
export type Post = {
  id: string;
  category: CategoryId;
  title: string;
  content: string;
  author: User;
  place: Place;
  distance: number;     // メートル
  images: string[];
  details?: PostDetails;
  urgency?: 'high' | 'medium' | 'low';
  allowComments: boolean;
  isEnded: boolean;
  commentCount: number;
  likeCount?: number;
  createdAt: string;
  expiresAt?: string;
};

// コメント
export type Comment = {
  id: string;
  author: User;
  content: string;
  canHelp: boolean;     // 「協力できます」バッジ
  createdAt: string;
};

// 投稿作成フォーム
export type PostFormData = {
  category: CategoryId;
  title: string;
  content: string;
  images: string[];
  allowComments: boolean;
  place?: Place;
} & PostDetails;

// マイページの投稿サマリー（ProfileScreen用）
export type MyPost = {
  id: number;
  /** カテゴリID */
  category: CategoryId;
  /** 投稿タイトル */
  title: string;
  /** 投稿からの経過時間 */
  time: string;
  /** 公開中 or 終了済み */
  status: 'active' | 'ended';
  /** 閲覧数 */
  views: number;
  /** コメント数 */
  comments: number;
};

// 検索画面のトレンド投稿（SearchScreen用）
export type TrendingPost = {
  id: number;
  category: string;
  title: string;
  spotName: string;
  distance: number;
  time: string;
  comments: number;
  likes: number;
};

// 検索画面の過去盛り上がり投稿（SearchScreen用）
export type PastHotPost = {
  id: number;
  category: string;
  title: string;
  spotName: string;
  time: string;
  comments: number;
  likes: number;
  participants?: number;
};
