import { MapPin, MessageCircle, Search, Newspaper, Settings, Bell, Plus, Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { Avatar } from "@/components/ui/Avatar";

const nav = [
  { href: "/nearby", label: "ちかく", icon: MapPin },
  { href: "/feed", label: "フィード", icon: Newspaper },
  { href: "/talk", label: "トーク", icon: MessageCircle },
  { href: "/search", label: "さがす", icon: Search },
];

export function Sidebar({ pathname }: { pathname: string }) {
  const { isDark, toggle } = useThemeStore();
  const { profile, isGuest } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[220px] flex-col border-r border-border-t bg-surface px-3 py-6 lg:flex">
      <a href="/nearby" className="mb-8 flex items-center gap-2.5 px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse-glow" />
        <span className="text-lg font-bold text-text-p">Navios</span>
      </a>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <a key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-accent/10 text-accent" : "text-sub hover:bg-surface2 hover:text-text-p"}`}>
              <item.icon size={18} />{item.label}
            </a>
          );
        })}
        <div className="my-3 h-px bg-border-t" />
        <a href="/notifications" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${pathname === "/notifications" ? "bg-accent/10 text-accent" : "text-sub hover:bg-surface2 hover:text-text-p"}`}>
          <Bell size={18} />通知
        </a>
        <a href="/settings" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${pathname === "/settings" ? "bg-accent/10 text-accent" : "text-sub hover:bg-surface2 hover:text-text-p"}`}>
          <Settings size={18} />設定
        </a>
      </nav>

      <a href="/post" className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-dark hover:shadow-lg hover:shadow-glow">
        <Plus size={18} />投稿する
      </a>

      <div className="flex items-center justify-between border-t border-border-t pt-4">
        <button onClick={toggle} className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-text-p" aria-label="テーマ切り替え">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {!isGuest && profile ? (
          <a href={`/profile/${profile.id}`} className="flex items-center gap-2">
            <Avatar src={profile.avatar_url} size="sm" />
            <span className="max-w-[100px] truncate text-xs font-medium text-text-p">{profile.display_name}</span>
          </a>
        ) : (
          <a href="/auth/login" className="text-xs font-medium text-accent hover:underline">ログイン</a>
        )}
      </div>
    </aside>
  );
}
