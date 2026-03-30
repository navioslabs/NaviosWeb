import type { PostCategory } from "@/types";

const styles: Record<PostCategory, string> = {
  lifeline: "bg-accent/15 text-accent",
  event: "bg-purple/15 text-purple",
  help: "bg-amber/15 text-amber",
};
const labels: Record<PostCategory, string> = {
  lifeline: "ライフライン",
  event: "イベント",
  help: "近助",
};

export function CategoryPill({ category }: { category: PostCategory }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[category]}`}>{labels[category]}</span>;
}
