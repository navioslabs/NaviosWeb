import { Heart, MessageCircle, Award } from "lucide-react";
import type { Talk } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";

export function TalkCard({ talk }: { talk: Talk }) {
  const expiresAt = new Date(talk.created_at).getTime() + 24 * 3600_000;
  const remaining = expiresAt - Date.now();
  const hrs = Math.max(0, Math.floor(remaining / 3600_000));
  const mins = Math.max(0, Math.floor((remaining % 3600_000) / 60000));

  return (
    <a href={`/talk/${talk.id}`} className="block">
      <article className="glass-card rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Avatar src={talk.author?.avatar_url} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-p">{talk.author?.display_name ?? "名無し"}</span>
              <TimeAgo date={talk.created_at} />
              {talk.is_hall_of_fame && <span className="flex items-center gap-0.5 text-amber"><Award size={12} /><span className="text-[10px] font-semibold">殿堂入り</span></span>}
            </div>
            <p className="mt-1.5 text-sm text-text-p leading-relaxed whitespace-pre-wrap">{talk.message}</p>
            {talk.image_urls?.[0] && <div className="mt-2 overflow-hidden rounded-xl"><img src={talk.image_urls[0]} alt="" className="h-40 w-full object-cover" loading="lazy" /></div>}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1"><Heart size={14} />{talk.likes_count}</span>
              <span className="flex items-center gap-1"><MessageCircle size={14} />{talk.replies_count}</span>
              {!talk.is_hall_of_fame && remaining > 0 && <span className="text-[10px]">あと{hrs}時間{mins}分</span>}
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
