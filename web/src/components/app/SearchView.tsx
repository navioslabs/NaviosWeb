import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { searchPosts } from "@/lib/posts";
import { PostCard } from "@/components/feed/PostCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export function SearchView() {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", term],
    queryFn: () => searchPosts(term),
    enabled: term.length > 0,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-text-p">さがす</h1>
      <form onSubmit={(e) => { e.preventDefault(); setTerm(query.trim()); }} className="mt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-xl border border-border-t bg-surface py-3 pl-10 pr-4 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none" placeholder="キーワードで検索..." />
        </div>
      </form>
      <div className="mt-6 space-y-3">
        {isLoading && <Spinner />}
        {!isLoading && term && results?.length === 0 && <EmptyState message="検索結果がありません" />}
        {!term && <div className="py-16 text-center text-sm text-muted">キーワードを入力して投稿を検索</div>}
        {results?.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
