# 04 UI/Data Delivery Note (2026-03-14)

## 完了した依頼項目
1. Search を Supabase 化
2. Pulse を Supabase 化
3. 投稿画像アップロード導線を接続（Storage + `post_images`）
4. ログイン画面の `Community Info App` 文言削除
5. Nearby ホットカードの長文崩れ対策
6. 主要画面の文字化け修正
7. 投稿画面プレースホルダーを日本語化
8. 投稿日時入力をカレンダー化
9. 投稿完了ページを新規デザイン

## 実装ファイル
- `app/(tabs)/search.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/nearby.tsx`
- `app/post/create.tsx`
- `app/post/success.tsx`
- `lib/postService.ts`
- `constants/categories.ts`
- `components/post/PostCard.tsx`

## テスト状況
- コマンド実行を試行したが、実行環境に `node` / `npm` / `npx` がなく自動テストは未実行。
- 実機確認が必要な項目:
  - 画像アップロード成功/失敗時のUX
  - カレンダー入力値での投稿挙動
  - Nearbyカードと下部タブの重なり
