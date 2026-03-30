import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToastStore } from "@/stores/toast";

export function SignupForm() {
  const toast = useToastStore((s) => s.show);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 8) { toast("パスワードは8文字以上", "error"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { toast(error.message, "error"); setLoading(false); return; }
    if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, display_name: displayName });
    setLoading(false);
    toast("アカウントを作成しました", "success");
    window.location.href = "/nearby";
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent animate-pulse-glow" />
          <span className="text-2xl font-bold text-text-p">Navios</span>
        </div>
        <p className="text-sm text-sub">アカウントを作成</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-sub">表示名</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={20} className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none" placeholder="ニックネーム" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-sub">メールアドレス</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-sub">パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none" placeholder="8文字以上" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50">
          {loading ? "作成中..." : "アカウント作成"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">
        すでにアカウントをお持ちですか？ <a href="/auth/login" className="text-accent hover:underline">ログイン</a>
      </p>
    </div>
  );
}
