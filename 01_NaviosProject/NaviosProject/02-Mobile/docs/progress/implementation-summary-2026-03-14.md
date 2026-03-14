# 実装サマリー（2026-03-14）

## 目的
次の担当者が、現在の実装状態と未完了タスクを短時間で把握できるように整理する。

## 進捗概要
- 認証（ログイン/新規登録/ログアウト）: 実装済み
- ルート認証ガード: 実装済み
- 投稿データ取得（通常）: Supabase化済み
- Nearby投稿取得: `get_nearby_posts` RPC 接続済み
- 投稿詳細: Supabase read 接続済み
- コメント: read/write 接続済み
- 投稿作成: `posts` + `post_details` insert 接続済み
- マイページ: モックから Supabase化済み

## 主要ファイル
- 認証
  - `lib/auth.ts`
  - `hooks/useAuth.ts`
  - `app/auth/login.tsx`
  - `app/auth/register.tsx`
  - `app/_layout.tsx`
- 投稿サービス層
  - `lib/postService.ts`
- Hook
  - `hooks/usePosts.ts`
  - `hooks/useNearbyPosts.ts`
  - `hooks/useLocation.ts`
- 画面
  - `app/(tabs)/nearby.tsx`
  - `app/post/[id].tsx`
  - `app/post/create.tsx`
  - `app/(tabs)/profile.tsx`

## 近くタブの仕様（現在）
- 位置情報取得成功時:
  - `get_nearby_posts` RPC の結果を優先表示
  - RPCで拾えない投稿は通常投稿を補完表示（一覧後方）
- 位置情報取得失敗時:
  - 通常投稿一覧へ自動フォールバック
  - 警告メッセージを表示

## 既知の注意点
- `search` タブと `pulse(index)` タブはまだ `lib/mockData.ts` 依存が残っている
- 画像アップロード（`post_images`）は未接続
- この作業環境では `node/npm/npx` が利用不可のため、Expo実機起動の最終確認は未実施

## 推奨の次タスク
1. `app/(tabs)/search.tsx` のモック依存を Supabase 化
2. `app/(tabs)/index.tsx`（Pulse）を Supabase 化
3. 投稿画像のアップロード導線を接続（Storage + `post_images`）
4. Nearby の地図表示を MapLibre 本実装に接続

## 引き継ぎ時チェックリスト
- `.env` が設定されていること
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Supabase 側に `get_nearby_posts` RPC が存在すること
- RLS で以下が許可されていること
  - users の自分データ read
  - posts の read / own insert
  - comments の read / own insert

