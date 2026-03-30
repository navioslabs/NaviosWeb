import { PageWrapper } from "../PageWrapper";
import { PostDetail } from "@/components/feed/PostDetail";
export function FeedDetailPage({ id }: { id: string }) { return <PageWrapper pathname={`/feed/${id}`}><PostDetail id={id} /></PageWrapper>; }
