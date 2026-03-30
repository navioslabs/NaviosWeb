import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ArrowLeft, Send, Award } from "lucide-react";
import { fetchTalkById, fetchTalkReplies, createTalkReply } from "@/lib/talks";
import { toggleLike } from "@/lib/likes";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { Spinner } from "@/components/ui/Spinner";

export function TalkDetail({ id }: { id: string }) {
  const { user } = useAuthStore();
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const { data: talk, isLoading } = useQuery({ queryKey: ["talk", id], queryFn: () => fetchTalkById(id) });
  const { data: replies } = useQuery({ queryKey: ["talk-replies", id], queryFn: () => fetchTalkReplies(id) });

  const likeMut = useMutation({ mutationFn: () => toggleLike(user!.id, "talk", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["talk", id] }) });
  const replyMut = useMutation({
    mutationFn: () => createTalkReply({ talk_id: id, author_id: user!.id, body }),
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: ["talk-replies", id] }); },
  });

  if (isLoading || !talk) return <Spinner />;

  return (
    <div>
      <a href="/talk" className="mb-4 inline-flex items-center gap-1 text-sm text-sub hover:text-text-p"><ArrowLeft size={16} />戻る</a>
      <article className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <a href={`/profile/${talk.author_id}`}><Avatar src={talk.author?.avatar_url} /></a>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-p">{talk.author?.display_name}</span><TimeAgo date={talk.created_at} />
              {talk.is_hall_of_fame && <span className="flex items-center gap-0.5 text-amber"><Award size={14} /><span className="text-xs font-semibold">殿堂入り</span></span>}
            </div>
            <p className="mt-2 text-text-p leading-relaxed whitespace-pre-wrap">{talk.message}</p>
            {talk.image_urls?.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto">{talk.image_urls.map((u, i) => <img key={i} src={u} alt="" className="h-56 rounded-xl object-cover" />)}</div>}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-border-t pt-4">
          <button onClick={() => { if (!user) return toast("ログインが必要です", "info"); likeMut.mutate(); }} className="flex items-center gap-1.5 text-sm text-sub hover:text-red transition-colors"><Heart size={18} />{talk.likes_count}</button>
        </div>
      </article>
      <div className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-text-p">リプライ ({replies?.length ?? 0})</h2>
        <div className="space-y-3">
          {replies?.map((r) => (
            <div key={r.id} className="flex gap-3 rounded-xl bg-surface2 p-4">
              <Avatar src={r.author?.avatar_url} size="sm" />
              <div><div className="flex items-center gap-2"><span className="text-xs font-medium text-text-p">{r.author?.display_name}</span><TimeAgo date={r.created_at} /></div><p className="mt-1 text-sm text-sub">{r.body}</p></div>
            </div>
          ))}
        </div>
        {user && (
          <form onSubmit={(e) => { e.preventDefault(); if (body.trim()) replyMut.mutate(); }} className="mt-4 flex gap-2">
            <input value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} className="flex-1 rounded-xl border border-border-t bg-surface px-4 py-2.5 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none" placeholder="リプライを書く..." />
            <button type="submit" disabled={!body.trim()} className="rounded-xl bg-accent px-4 py-2.5 text-white hover:bg-accent-dark disabled:opacity-40"><Send size={16} /></button>
          </form>
        )}
      </div>
    </div>
  );
}
