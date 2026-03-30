import { Bell, Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { useLocationStore } from "@/stores/location";

export function MobileHeader() {
  const { isDark, toggle } = useThemeStore();
  const watching = useLocationStore((s) => s.watching);

  return (
    <header className="fixed top-0 z-40 flex w-full items-center justify-between border-b border-border-t bg-surface/80 px-4 py-3 backdrop-blur-xl lg:hidden">
      <a href="/nearby" className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
        <span className="text-base font-bold text-text-p">Navios</span>
        {watching && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-accent animate-live" title="位置追跡中" />}
      </a>
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="rounded-lg p-2 text-muted hover:text-text-p">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <a href="/notifications" className="rounded-lg p-2 text-muted hover:text-text-p"><Bell size={18} /></a>
      </div>
    </header>
  );
}
