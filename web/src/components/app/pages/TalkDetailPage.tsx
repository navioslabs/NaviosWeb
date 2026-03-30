import { PageWrapper } from "../PageWrapper";
import { TalkDetail } from "@/components/talk/TalkDetail";
export function TalkDetailPage({ id }: { id: string }) { return <PageWrapper pathname={`/talk/${id}`}><TalkDetail id={id} /></PageWrapper>; }
