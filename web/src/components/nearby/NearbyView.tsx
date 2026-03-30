import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, RefreshCw, Radio } from "lucide-react";
import { fetchNearbyPosts } from "@/lib/posts";
import { useLocationStore } from "@/stores/location";
import { PostCard } from "@/components/feed/PostCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Post } from "@/types";

function groupByDistance(posts: Post[]) {
  const g = [
    { label: "300m以内", posts: [] as Post[] },
    { label: "300m〜600m", posts: [] as Post[] },
    { label: "600m以上", posts: [] as Post[] },
  ];
  for (const p of posts) {
    const d = p.distance_m ?? Infinity;
    if (d <= 300) g[0].posts.push(p);
    else if (d <= 600) g[1].posts.push(p);
    else g[2].posts.push(p);
  }
  return g.filter((x) => x.posts.length > 0);
}

export function NearbyView() {
  const { lat, lng, watching, error: geoError } = useLocationStore();
  const prevCoords = useRef<{ lat: number; lng: number } | null>(null);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["nearby", lat, lng],
    queryFn: () => fetchNearbyPosts(lat!, lng!),
    enabled: lat != null && lng != null,
    refetchInterval: 60_000,
  });

  // 100m以上移動したら自動でrefetch
  useEffect(() => {
    if (lat == null || lng == null) return;
    if (prevCoords.current) {
      const dlat = lat - prevCoords.current.lat;
      const dlng = lng - prevCoords.current.lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 111_000;
      if (dist < 100) return;
    }
    prevCoords.current = { lat, lng };
    refetch();
  }, [lat, lng, refetch]);

  const groups = posts ? groupByDistance(posts) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-p">ちかく</h1>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} />
            {lat != null ? "現在地の周辺を表示中" : geoError ? geoError : "位置情報を取得中..."}
            {watching && <Radio size={10} className="ml-1 text-accent animate-live" />}
          </p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-text-p"><RefreshCw size={18} /></button>
      </div>

      {isLoading && <Spinner />}
      {!isLoading && groups.length === 0 && <EmptyState message={geoError ? "位置情報を許可して近くの投稿を見つけましょう" : "近くに投稿がありません"} />}

      {groups.map((g) => (
        <div key={g.label} className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold text-sub tracking-wider">{g.label}</span>
            <span className="text-[10px] text-muted">{g.posts.length}件</span>
          </div>
          <div className="space-y-3">{g.posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        </div>
      ))}
    </div>
  );
}
