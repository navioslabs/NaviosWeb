import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Image as ImageIcon, MapPin } from "lucide-react";
import { createPost } from "@/lib/posts";
import { createTalk } from "@/lib/talks";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

export function PostForm({ isTalk = false }: { isTalk?: boolean }) {
  const { user } = useAuthStore();
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();
  const [cat, setCat] = useState<"lifeline" | "event" | "help">("lifeline");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const postMut = useMutation({
    mutationFn: () => createPost({ author_id: user!.id, category: cat, title, content, image_urls: [], location_text: null, deadline: null, tags: [] }),
    onSuccess: () => { toast("投稿しました", "success"); qc.invalidateQueries({ queryKey: ["posts"] }); window.location.href = "/feed"; },
    onError: () => toast("投稿に失敗しました", "error"),
  });
  const talkMut = useMutation({
    mutationFn: () => createTalk({ author_id: user!.id, message, image_urls: [], tags: [] }),
    onSuccess: () => { toast("つぶやきました", "success"); qc.invalidateQueries({ queryKey: ["talks"] }); window.location.href = "/talk"; },
    onError: () => toast("投稿に失敗しました", "error"),
  });

  if (!user) return <div className="py-20 text-center"><p className="text-sub">投稿するにはログインが必要です</p><a href="/auth/login" className="mt-3 inline-block text-accent hover:underline">ログイン</a></div>;

  return (
    <div>
      <a href={isTalk ? "/talk" : "/feed"} className="mb-4 inline-flex items-center gap-1 text-sm text-sub hover:text-text-p"><ArrowLeft size={16} />戻る</a>
      <h1 className="text-xl font-bold text-text-p">{isTalk ? "トークを投稿" : "新しい投稿"}</h1>

      {isTalk ? (
        <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) talkMut.mutate(); }} className="mt-6 space-y-4">
          <div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={140} rows={4} className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none resize-none" placeholder="いま何が起きていますか？" />
            <p className="mt-1 text-right text-xs text-muted">{message.length}/140</p>
          </div>
          <button type="submit" disabled={!message.trim() || talkMut.isPending} className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50">つぶやく</button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) postMut.mutate(); }} className="mt-6 space-y-4">
          <div className="flex gap-2">
            {(["lifeline", "event", "help"] as const).map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${cat === c ? "bg-accent text-white" : "bg-surface2 text-sub hover:text-text-p"}`}>
                {{ lifeline: "ライフライン", event: "イベント", help: "近助" }[c]}
              </button>
            ))}
          </div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none" placeholder="タイトル" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} maxLength={2000} className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none resize-none" placeholder="詳細（任意）" />
          <div className="flex items-center gap-3 text-muted">
            <button type="button" className="flex items-center gap-1 rounded-lg p-2 hover:bg-surface2"><ImageIcon size={18} /><span className="text-xs">画像</span></button>
            <button type="button" className="flex items-center gap-1 rounded-lg p-2 hover:bg-surface2"><MapPin size={18} /><span className="text-xs">場所</span></button>
          </div>
          <button type="submit" disabled={!title.trim() || postMut.isPending} className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50">投稿する</button>
        </form>
      )}
    </div>
  );
}
