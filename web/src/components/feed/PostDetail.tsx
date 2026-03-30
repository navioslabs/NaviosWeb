import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, MapPin, ArrowLeft, Send } from "lucide-react";
import { fetchPostById } from "@/lib/posts";
import { fetchComments, createComment } from "@/lib/comments";
import { toggleLike } from "@/lib/likes";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { Spinner } from "@/components/ui/Spinner";

export function PostDetail({ id }: { id: string }) {
  const { user } = useAuthStore();
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const { data: post, isLoading } = useQuery({ queryKey: ["post", id], queryFn: () => fetchPostById(id) });
  const { data: comments } = useQuery({ queryKey: ["comments", id], queryFn: () => fetchComments(id) });

  const likeMut = useMutation({ mutationFn: () => toggleLike(user!.id, "post", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["post", id] }) });
  const commentMut = useMutation({
    mutationFn: () => createComment({ post_id: id, author_id: user!.id, body }),
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: ["comments", id] }); qc.invalidateQueries({ queryKey: ["post", id] }); },
  });

  if (isLoading || !post) return <Spinner />;

  return (
    <div>
      <a href="/feed" className="mb-4 inline-flex items-center gap-1 text-sm text-sub hover:text-text-p"><ArrowLeft size={16} />戻る</a>
      <article className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <a href={`/profile/${post.author_id}`}><Avatar src={post.author?.avatar_url} /></a>
          <div className="flex-1"><p className="font-medium text-text-p">{post.author?.display_name}</p><TimeAgo date={post.created_at} /></div>
          <CategoryPill category={post.category} />
        </div>
        <h1 className="mt-4 text-lg font-bold text-text-p">{post.title}</h1>
        {post.content && <p className="mt-2 text-sm text-sub leading-relaxed whitespace-pre-wrap">{post.content}</p>}
        {post.image_urls?.length > 0 && <div className="mt-4 flex gap-2 overflow-x-auto">{post.image_urls.map((u, i) => <img key={i} src={u} alt="" className="h-56 rounded-xl object-cover" />)}</div>}
        {post.location_text && <p className="mt-4 flex items-center gap-1 text-sm text-muted"><MapPin size={14} />{post.location_text}</p>}
        <div className="mt-4 flex items-center gap-4 border-t border-border-t pt-4">
          <button onClick={() => { if (!user) return toast("ログインが必要です", "info"); likeMut.mutate(); }} className="flex items-center gap-1.5 text-sm text-sub hover:text-red transition-colors"><Heart size={18} />{post.likes_count}</button>
          <span className="flex items-center gap-1.5 text-sm text-sub"><MessageCircle size={18} />{post.comments_count}</span>
        </div>
      </article>

      <div className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-text-p">コメント ({comments?.length ?? 0})</h2>
        <div className="space-y-3">
          {comments?.map((c) => (
            <div key={c.id} className="flex gap-3 rounded-xl bg-surface2 p-4">
              <Avatar src={c.author?.avatar_url} size="sm" />
              <div><div className="flex items-center gap-2"><span className="text-xs font-medium text-text-p">{c.author?.display_name}</span><TimeAgo date={c.created_at} /></div><p className="mt-1 text-sm text-sub">{c.body}</p></div>
            </div>
          ))}
        </div>
        {user && (
          <form onSubmit={(e) => { e.preventDefault(); if (body.trim()) commentMut.mutate(); }} className="mt-4 flex gap-2">
            <input value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} className="flex-1 rounded-xl border border-border-t bg-surface px-4 py-2.5 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none" placeholder="コメントを書く..." />
            <button type="submit" disabled={!body.trim()} className="rounded-xl bg-accent px-4 py-2.5 text-white hover:bg-accent-dark disabled:opacity-40"><Send size={16} /></button>
          </form>
        )}
      </div>
    </div>
  );
}
