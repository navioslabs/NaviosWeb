import { useQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { fetchTalks } from "@/lib/talks";
import { TalkCard } from "./TalkCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export function TalkView() {
  const { data: talks, isLoading } = useQuery({
    queryKey: ["talks"],
    queryFn: () => fetchTalks(),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-p">トーク</h1>
          <p className="mt-0.5 text-xs text-muted">140文字のつぶやき・24時間で消えます</p>
        </div>
        <a href="/post?type=talk" className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-dark">
          <PenLine size={14} />つぶやく
        </a>
      </div>
      <div className="mt-6 space-y-3">
        {isLoading && <Spinner />}
        {!isLoading && talks?.length === 0 && <EmptyState message="まだトークがありません" />}
        {talks?.map((t) => <TalkCard key={t.id} talk={t} />)}
      </div>
    </div>
  );
}
