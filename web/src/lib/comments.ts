import { supabase } from "./supabase";
import type { Comment } from "@/types";

export async function fetchComments(postId: string): Promise<Comment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("comments").select(`*, author:profiles(*)`).eq("post_id", postId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data as Comment[]) ?? [];
}

export async function createComment(c: { post_id: string; author_id: string; body: string }): Promise<Comment> {
  const { data, error } = await supabase.from("comments").insert(c).select(`*, author:profiles(*)`).single();
  if (error) throw error;
  return data as Comment;
}
