import { Sun, Moon, LogOut, User, Shield } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { useToastStore } from "@/stores/toast";

export function SettingsView() {
  const { isDark, toggle } = useThemeStore();
  const { user, profile, reset } = useAuthStore();
  const toast = useToastStore((s) => s.show);

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    reset();
    toast("ログアウトしました", "success");
    window.location.href = "/auth/login";
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-p">設定</h1>
      <div className="mt-6 space-y-2">
        <button onClick={toggle} className="flex w-full items-center justify-between rounded-xl bg-surface p-4 text-left hover:bg-surface2">
          <div className="flex items-center gap-3">{isDark ? <Moon size={18} className="text-sub" /> : <Sun size={18} className="text-sub" />}<span className="text-sm text-text-p">テーマ</span></div>
          <span className="text-xs text-muted">{isDark ? "ダーク" : "ライト"}</span>
        </button>
        {user && profile && <a href={`/profile/${user.id}`} className="flex w-full items-center gap-3 rounded-xl bg-surface p-4 hover:bg-surface2"><User size={18} className="text-sub" /><span className="text-sm text-text-p">プロフィール</span></a>}
        <div className="flex items-center gap-3 rounded-xl bg-surface p-4"><Shield size={18} className="text-sub" /><span className="text-sm text-text-p">プライバシー</span><span className="ml-auto text-xs text-muted">準備中</span></div>
        {user && <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl bg-surface p-4 text-left hover:bg-red/10"><LogOut size={18} className="text-red" /><span className="text-sm text-red">ログアウト</span></button>}
      </div>
    </div>
  );
}
