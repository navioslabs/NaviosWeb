import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/posts";
import { PostCard } from "./PostCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

const cats = [
  { key: "", label: "すべて" },
  { key: "lifeline", label: "ライフライン" },
  { key: "event", label: "イベント" },
  { key: "help", label: "近助" },
];

export function FeedView() {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", category, date],
    queryFn: () => fetchPosts({ category: category || undefined, date }),
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-text-p">フィード</h1>
      <p className="mt-0.5 text-xs text-muted">あなたの街の「今日」</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-border-t bg-surface px-3 py-1.5 text-xs text-text-p focus:border-accent focus:outline-none" />
        <div className="flex gap-1.5">
          {cats.map((c) => (
            <button key={c.key} onClick={() => setCategory(c.key)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${category === c.key ? "bg-accent text-white" : "bg-surface2 text-sub hover:text-text-p"}`}>{c.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {isLoading && <Spinner />}
        {!isLoading && posts?.length === 0 && <EmptyState />}
        {posts?.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
