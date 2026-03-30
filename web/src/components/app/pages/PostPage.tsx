import { PageWrapper } from "../PageWrapper";
import { PostForm } from "../PostForm";
export function PostPage({ isTalk }: { isTalk: boolean }) { return <PageWrapper pathname="/post"><PostForm isTalk={isTalk} /></PageWrapper>; }
