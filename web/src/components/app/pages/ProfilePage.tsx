import { PageWrapper } from "../PageWrapper";
import { ProfileView } from "../ProfileView";
export function ProfilePage({ id }: { id: string }) { return <PageWrapper pathname={`/profile/${id}`}><ProfileView id={id} /></PageWrapper>; }
