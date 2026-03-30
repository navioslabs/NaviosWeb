import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToastStore } from "@/stores/toast";

export function LoginForm() {
  const toast = useToastStore((s) => s.show);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast(error.message, "error");
    else { toast("ログインしました", "success"); window.location.href = "/nearby"; }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent animate-pulse-glow" />
          <span className="text-2xl font-bold text-text-p">Navios</span>
        </div>
        <p className="text-sm text-sub">すぐそばの暮らしが、見えてくる。</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-sub">メールアドレス</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-sub">パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-border-t bg-surface px-4 py-3 text-sm text-text-p placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" placeholder="8文字以上" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50">
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between text-xs">
        <a href="/auth/signup" className="text-accent hover:underline">アカウント作成</a>
        <a href="/nearby" className="text-muted hover:text-sub">ゲストで見る</a>
      </div>
    </div>
  );
}
