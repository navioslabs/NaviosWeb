import { MapPin, MessageCircle, Search, Newspaper, Plus } from "lucide-react";

const tabs = [
  { href: "/nearby", label: "ちかく", icon: MapPin },
  { href: "/feed", label: "フィード", icon: Newspaper },
  { href: "/post", label: "投稿", icon: Plus, accent: true },
  { href: "/talk", label: "トーク", icon: MessageCircle },
  { href: "/search", label: "さがす", icon: Search },
];

export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed bottom-0 z-40 flex w-full items-center justify-around border-t border-border-t bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        if (tab.accent) return (
          <a key={tab.href} href={tab.href} className="flex -translate-y-2 items-center justify-center rounded-full bg-accent p-3 shadow-lg shadow-glow transition-transform hover:scale-105">
            <tab.icon size={20} className="text-white" />
          </a>
        );
        return (
          <a key={tab.href} href={tab.href} className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${active ? "text-accent" : "text-muted"}`}>
            <tab.icon size={20} />{tab.label}
          </a>
        );
      })}
    </nav>
  );
}
