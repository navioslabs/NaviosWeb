import { Inbox } from "lucide-react";

export function EmptyState({ message = "まだ投稿がありません" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Inbox size={40} className="text-muted" />
      <p className="mt-4 text-sm text-sub">{message}</p>
    </div>
  );
}
