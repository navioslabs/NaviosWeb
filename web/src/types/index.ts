export type PostCategory = "lifeline" | "event" | "help";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location_text: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  category: PostCategory;
  title: string;
  content: string | null;
  image_url: string | null;
  image_urls: string[];
  location_text: string | null;
  deadline: string | null;
  crowd: "crowded" | "moderate" | "empty" | null;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  author?: Profile;
  distance_m?: number;
  lat?: number;
  lng?: number;
}

export interface Talk {
  id: string;
  author_id: string;
  message: string;
  image_url: string | null;
  image_urls: string[];
  location_text: string | null;
  likes_count: number;
  replies_count: number;
  tags: string[];
  is_hall_of_fame: boolean;
  created_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  likes_count: number;
  created_at: string;
  author?: Profile;
}

export interface TalkReply {
  id: string;
  talk_id: string;
  author_id: string;
  body: string;
  likes_count: number;
  created_at: string;
  author?: Profile;
}

export type LikeTargetType = "post" | "talk" | "comment" | "reply";
