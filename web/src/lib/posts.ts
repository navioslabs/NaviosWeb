import { supabase } from "./supabase";
import type { Post } from "@/types";

const SEL = `*, author:profiles(*)`;

export async function fetchPosts(p?: { category?: string; date?: string; page?: number; limit?: number }): Promise<Post[]> {
  if (!supabase) return [];
  const { category, date, page = 0, limit = 20 } = p ?? {};
  let q = supabase.from("posts").select(SEL).order("created_at", { ascending: false }).range(page * limit, (page + 1) * limit - 1);
  if (category) q = q.eq("category", category);
  if (date) q = q.gte("created_at", `${date}T00:00:00`).lt("created_at", `${date}T23:59:59`);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Post[]) ?? [];
}

export async function fetchPostById(id: string): Promise<Post> {
  const { data, error } = await supabase.from("posts").select(SEL).eq("id", id).single();
  if (error) throw error;
  return data as Post;
}

export async function fetchNearbyPosts(lat: number, lng: number, radiusM = 1000): Promise<Post[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("nearby_posts", { user_lat: lat, user_lng: lng, radius_m: radiusM });
  if (error) throw error;
  return (data as Post[]) ?? [];
}

export async function searchPosts(query: string): Promise<Post[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("posts").select(SEL).or(`title.ilike.%${query}%,content.ilike.%${query}%`).order("created_at", { ascending: false }).limit(30);
  if (error) throw error;
  return (data as Post[]) ?? [];
}

export async function createPost(post: Partial<Post> & { author_id: string; category: string; title: string }): Promise<Post> {
  const { data, error } = await supabase.from("posts").insert(post).select(SEL).single();
  if (error) throw error;
  return data as Post;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
