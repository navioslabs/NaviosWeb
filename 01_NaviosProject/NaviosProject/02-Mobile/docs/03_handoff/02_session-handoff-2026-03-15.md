# Session Handoff (2026-03-15, final)

## Goal
次担当者が、追加調査なしで実装を継続できる状態にする。

---

## What Was Implemented（全21項目）

### Phase 1: 基盤修正
1. カテゴリ名正式化（`constants/categories.ts`）— 物資/イベント/近助/行政
2. Nearby画面フローティングプレビューカード（ピンタップ→スライドイン）

### Phase 2: 4画面同時改修
3. マイページ — アバター画像アップロード + ユーザー名インライン編集
4. 投稿画面 — モダンUI（2x2カテゴリ、セクションディバイダー）+ 時刻ピッカーモーダル
5. Pulse — ヘッダー削除、検索ボックス下部フローティング、ティール系カラー
6. 検索→タイムライン — SectionList（最新/盛り上がり/過去の人気）、オレンジテーマ

### Phase 3: 品質向上（15項目一括）
7. `constants/design.ts` 作成（FontSize/Spacing/Radius/Duration/Shadow）
8. `constants/colors.ts` 拡張（teal/orange/purple追加）
9. `CategoryDetailCard.tsx` ハードコード色 → getCategoryInfo()
10. `index.tsx`（Pulse）のカラー定数化
11. 認証画面（login/register）全テキスト日本語化
12. 認証画面 Alert → インラインエラー表示
13. `SkeletonLoader.tsx` 新規作成 + タイムライン/プロフィールに適用
14. `PostCard.tsx` 固定幅176px → レスポンシブ（画面幅42%）
15. いいね永続化（`toggleLike` / `checkUserLiked` in postService）
16. コメント自動ページネーション（スクロール末尾で自動読み込み）
17. ハプティック（いいね/コメント送信/シェア）
18. 投稿の終了/削除（著者に「...」メニュー表示）
19. 投稿作成3ステップ化（基本→詳細→確認）+ ステップインジケーター
20. 位置情報手動入力フォールバック

### Phase 4: UI仕上げ
21. マイページ全面リニューアル（ヒーローヘッダー、統計バー、投稿リストにナビ、メニュー形式アカウント欄）

---

## Files Changed（全ファイル一覧）

### 新規作成
- `constants/design.ts` — デザイントークン
- `components/common/SkeletonLoader.tsx` — スケルトンローダー

### 大幅変更
- `app/(tabs)/profile.tsx` — ヒーロー型UI全面リニューアル
- `app/(tabs)/search.tsx` — タイムライン画面に変換（SectionList）
- `app/(tabs)/index.tsx` — Pulse改修（レイアウト、カラー）
- `app/post/create.tsx` — 3ステップ化 + 位置情報フォールバック
- `app/post/[id].tsx` — いいね永続化、コメント自動読み込み、投稿管理、ハプティック
- `lib/postService.ts` — toggleLike/checkUserLiked/endPost/deletePost/optimizeImage追加

### 修正
- `app/(tabs)/_layout.tsx` — タブラベル/アイコン変更
- `app/(tabs)/nearby.tsx` — フローティングカード追加
- `app/auth/login.tsx` — 日本語化 + インラインエラー
- `app/auth/register.tsx` — 日本語化 + インラインエラー
- `constants/categories.ts` — ラベル修正
- `constants/colors.ts` — 色追加
- `components/common/UserAvatar.tsx` — URL画像対応
- `components/post/PostCard.tsx` — レスポンシブ幅
- `components/post/CategoryDetailCard.tsx` — ハードコード色排除
- `CLAUDE.md` — コード規約追加、アーキテクチャ更新

---

## Before Running（セットアップ手順）

### 1. パッケージインストール
```bash
npx expo install expo-haptics expo-image-manipulator
```

### 2. Supabase DB
```sql
CREATE TABLE post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "いいねは誰でも読める" ON post_likes FOR SELECT USING (true);
CREATE POLICY "自分のいいねを追加できる" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のいいねを削除できる" ON post_likes FOR DELETE USING (auth.uid() = user_id);
```

### 3. Supabase Storage
- `avatars` バケットを Public で作成

---

## What's NOT Done Yet

- MapLibre 未統合（地図はプレースホルダー）
- 全画面の実機テスト未実施
- コメント楽観更新未完
- `lib/mockData.ts` 残存（削除可）
- `components/common/BottomTabBar.tsx` 残存（削除可）

---

## Next Steps（推奨順）

1. **MapLibre統合** — `app/(tabs)/nearby.tsx` の `mapPlaceholder` を実地図に置き換え
2. **実機回帰テスト** — 全画面（認証/投稿/画像/アバター/いいね/タイムライン）
3. **不要ファイル削除** — `lib/mockData.ts`, `components/common/BottomTabBar.tsx`
4. **コメント楽観更新** — 送信後の即時反映
5. **`create.tsx` 分割** — 1,406行 → ステップごとのサブコンポーネントに

---

## Environment Risk
- この実行環境では `node` / `npm` / `npx` が見つからず、テストコマンドを実行できない。
