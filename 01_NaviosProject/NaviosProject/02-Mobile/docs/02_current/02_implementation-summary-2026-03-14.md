# 実装サマリー（2026-03-14 更新）

## 進捗概要
- 認証（ログイン/新規登録/ログアウト）: 実装済み
- ルート認証ガード: 実装済み
- 投稿データ取得（通常）: Supabase化済み
- Nearby投稿取得: `get_nearby_posts` RPC 接続済み
- 投稿詳細: Supabase read 接続済み
- コメント: read/write 接続済み
- 投稿作成: `posts` + `post_details` + `post_images` 接続済み
- マイページ: Supabase化済み
- Search/Pulse: モック依存を除去し Supabase データ利用に移行済み

## 今回の更新（2026-03-14）
1. `app/(tabs)/search.tsx` を Supabase投稿ベースに移行
2. `app/(tabs)/index.tsx`（Pulse）を Supabase投稿ベースに移行
3. `app/post/create.tsx` に画像選択導線を追加（最大4枚）
4. `lib/postService.ts` に Storageアップロード + `post_images` insert を追加
5. 投稿完了画面 `app/post/success.tsx` を追加
6. ログイン画面の `Community Info App` 文言を削除
7. Nearbyのホットカード崩れ対策（長いタイトル時のレイアウト安定化）
8. 主要UIの文字化け文言を修正（カテゴリ名、タブ、詳細表示など）
9. 投稿日付入力をカレンダー選択に変更（eventDate/deadline）

## 既知の注意点
- `node` / `npm` / `npx` が実行環境にないため、型チェック/実機テストは未実行
- `MapLibre` 本接続は未完（地図はプレースホルダー）

## 推奨の次タスク
1. 実機で投稿画像アップロードの権限・速度・失敗時UIを検証
2. `MapLibre` 本接続（実座標ピン描画）
3. コメントのページングと楽観更新の改善
