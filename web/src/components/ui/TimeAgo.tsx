export function timeAgo(d: string): string {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}時間前`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}日前`;
  return new Date(d).toLocaleDateString("ja-JP");
}

export function TimeAgo({ date }: { date: string }) {
  return <span className="text-xs text-muted">{timeAgo(date)}</span>;
}
