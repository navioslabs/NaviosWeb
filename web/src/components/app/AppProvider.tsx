import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { useLocationStore } from "@/stores/location";
import { supabase } from "@/lib/supabase";
import { Toast } from "@/components/ui/Toast";

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

function AuthListener() {
  const { setUser, setProfile } = useAuthStore();
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => { if (data) setProfile(data); });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => { if (data) setProfile(data); });
    });
    return () => subscription.unsubscribe();
  }, [setUser, setProfile]);
  return null;
}

function ThemeSync() {
  const isDark = useThemeStore((s) => s.isDark);
  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); }, [isDark]);
  return null;
}

function LocationWatcher() {
  const { setCoords, setWatching, setError } = useLocationStore();
  useEffect(() => {
    if (!navigator.geolocation) { setError("位置情報非対応"); return; }
    setWatching(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => setCoords(pos.coords.latitude, pos.coords.longitude),
      () => setError("位置情報を取得できません"),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
    return () => { navigator.geolocation.clearWatch(id); setWatching(false); };
  }, [setCoords, setWatching, setError]);
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok) return null;
  return (
    <QueryClientProvider client={qc}>
      <ThemeSync />
      <AuthListener />
      <LocationWatcher />
      {children}
      <Toast />
    </QueryClientProvider>
  );
}
