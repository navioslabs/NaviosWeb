import { PageWrapper } from "../PageWrapper";
import { EmptyState } from "@/components/ui/EmptyState";
export function NotificationsPage() {
  return (
    <PageWrapper pathname="/notifications">
      <div>
        <h1 className="text-xl font-bold text-text-p">通知</h1>
        <div className="mt-6"><EmptyState message="通知はまだありません" /></div>
      </div>
    </PageWrapper>
  );
}
