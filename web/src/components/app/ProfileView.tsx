import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar, Shield } from "lucide-react";
import { fetchProfile } from "@/lib/profiles";
import { fetchPosts } from "@/lib/posts";
import { useAuthStore } from "@/stores/auth";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "@/components/feed/PostCard";
import { Spinner } from "@/components/ui/Spinner";

export function ProfileView({ id }: { id: string }) {
  const { user } = useAuthStore();
  const isOwn = user?.id === id;

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile", id], queryFn: () => fetchProfile(id) });
  const { data: posts } = useQuery({ queryKey: ["user-posts", id], queryFn: () => fetchPosts({ page: 0, limit: 10 }) });

  if (isLoading) return <Spinner />;
  if (!profile) return <div className="py-20 text-center text-sub">ユーザーが見つかりません</div>;

  return (
    <div>
      <a href="/nearby" className="mb-4 inline-flex items-center gap-1 text-sm text-sub hover:text-text-p"><ArrowLeft size={16} />戻る</a>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatar_url} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-text-p">{profile.display_name}</h1>{profile.is_verified && <Shield size={16} className="text-accent" />}</div>
            {profile.bio && <p className="mt-1 text-sm text-sub">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
              {profile.location_text && <span className="flex items-center gap-1"><MapPin size={12} />{profile.location_text}</span>}
              <span className="flex items-center gap-1"><Calendar size={12} />{new Date(profile.created_at).toLocaleDateString("ja-JP")}から利用</span>
            </div>
          </div>
          {isOwn && <a href="/profile/edit" className="rounded-lg border border-border-t px-3 py-1.5 text-xs text-sub hover:border-accent hover:text-accent">編集</a>}
        </div>
      </div>
      <h2 className="mt-8 mb-4 text-sm font-semibold text-text-p">投稿</h2>
      <div className="space-y-3">{posts?.map((p) => <PostCard key={p.id} post={p} />)}</div>
    </div>
  );
}
