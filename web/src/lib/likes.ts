import { supabase } from "./supabase";
import type { LikeTargetType } from "@/types";

export async function toggleLike(userId: string, targetType: LikeTargetType, targetId: string): Promise<boolean> {
  const { data: existing } = await supabase.from("likes").select("id").eq("user_id", userId).eq("target_type", targetType).eq("target_id", targetId).maybeSingle();
  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("likes").insert({ user_id: userId, target_type: targetType, target_id: targetId });
  return true;
}
