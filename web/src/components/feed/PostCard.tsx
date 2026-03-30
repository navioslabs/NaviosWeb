import { Heart, MessageCircle, MapPin, Clock } from "lucide-react";
import type { Post } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { TimeAgo } from "@/components/ui/TimeAgo";

export function PostCard({ post }: { post: Post }) {
  const hasDeadline = post.deadline && new Date(post.deadline) > new Date();
  return (
    <a href={`/feed/${post.id}`} className="block">
      <article className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Avatar src={post.author?.avatar_url} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-p">{post.author?.display_name ?? "名無し"}</p>
            <TimeAgo date={post.created_at} />
          </div>
          <CategoryPill category={post.category} />
        </div>
        <h3 className="mt-3 text-base font-semibold text-text-p leading-snug">{post.title}</h3>
        {post.content && <p className="mt-1.5 line-clamp-2 text-sm text-sub leading-relaxed">{post.content}</p>}
        {post.image_urls?.[0] && (
          <div className="mt-3 overflow-hidden rounded-xl">
            <img src={post.image_urls[0]} alt="" className="h-48 w-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><Heart size={14} />{post.likes_count}</span>
          <span className="flex items-center gap-1"><MessageCircle size={14} />{post.comments_count}</span>
          {post.location_text && <span className="flex items-center gap-1"><MapPin size={14} /><span className="max-w-[120px] truncate">{post.location_text}</span></span>}
          {hasDeadline && <span className="flex items-center gap-1 text-amber"><Clock size={14} />期限あり</span>}
          {post.distance_m != null && <span className="ml-auto text-accent font-medium">{post.distance_m < 1000 ? `${Math.round(post.distance_m)}m` : `${(post.distance_m / 1000).toFixed(1)}km`}</span>}
        </div>
      </article>
    </a>
  );
}
