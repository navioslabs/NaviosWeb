import { AppProvider } from "../AppProvider";
import { LoginForm } from "../LoginForm";
export function LoginPage() { return <AppProvider><div className="flex min-h-screen items-center justify-center bg-bg"><LoginForm /></div></AppProvider>; }
