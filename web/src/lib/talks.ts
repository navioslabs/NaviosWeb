import { supabase } from "./supabase";
import type { Talk, TalkReply } from "@/types";

const SEL = `*, author:profiles(*)`;

export async function fetchTalks(page = 0, limit = 20): Promise<Talk[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("talks").select(SEL).order("created_at", { ascending: false }).range(page * limit, (page + 1) * limit - 1);
  if (error) throw error;
  return (data as Talk[]) ?? [];
}

export async function fetchTalkById(id: string): Promise<Talk> {
  const { data, error } = await supabase.from("talks").select(SEL).eq("id", id).single();
  if (error) throw error;
  return data as Talk;
}

export async function createTalk(talk: { author_id: string; message: string; image_urls?: string[]; tags?: string[] }): Promise<Talk> {
  const { data, error } = await supabase.from("talks").insert(talk).select(SEL).single();
  if (error) throw error;
  return data as Talk;
}

export async function fetchTalkReplies(talkId: string): Promise<TalkReply[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("talk_replies").select(`*, author:profiles(*)`).eq("talk_id", talkId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data as TalkReply[]) ?? [];
}

export async function createTalkReply(reply: { talk_id: string; author_id: string; body: string }): Promise<TalkReply> {
  const { data, error } = await supabase.from("talk_replies").insert(reply).select(`*, author:profiles(*)`).single();
  if (error) throw error;
  return data as TalkReply;
}
