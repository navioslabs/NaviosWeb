import { CategoryId } from '../constants/categories';

export type User = {
  id: string;
  displayName: string;
  avatar: string;
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

export type Place = {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type PostDetails = {
  price?: string;
  stockStatus?: '在庫あり' | '残りわずか' | '入荷予定';
  stockDuration?: 'today' | '48hours' | '3days' | '1week' | 'manual';
  eventDate?: string;
  eventTime?: string;
  fee?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  helpType?: 'request' | 'share';
  reward?: string;
  estimatedTime?: string;
  deadline?: string;
  requirements?: string[];
};

export type Post = {
  id: string;
  category: CategoryId;
  title: string;
  content: string;
  author: User;
  place: Place;
  distance: number;
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
