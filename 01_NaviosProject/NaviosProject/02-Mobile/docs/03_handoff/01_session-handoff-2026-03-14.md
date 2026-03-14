# Session Handoff (2026-03-14, latest)

## Goal
次担当者が、追加調査なしで実装を継続できる状態にする。

## What Was Implemented
1. SearchタブをSupabase投稿データへ移行
2. PulseタブをSupabase投稿データへ移行
3. 投稿画像アップロード導線を接続
   - `expo-image-picker` による画像選択
   - `lib/postService.ts` で Storage `images` バケットへアップロード
   - `post_images` テーブルへ `image_url` / `display_order` insert
4. 投稿完了ページ `app/post/success.tsx` を追加
5. 投稿作成日付をカレンダー入力へ変更（eventDate / deadline）
6. Nearbyホットカードの長文タイトル崩れを修正
7. 主要UI文字化けを修正
8. ログイン画面の `Community Info App` 文言を削除

## Files to Review First
- `app/(tabs)/search.tsx`
- `app/(tabs)/index.tsx`
- `app/post/create.tsx`
- `app/post/success.tsx`
- `lib/postService.ts`
- `app/(tabs)/nearby.tsx`

## Validation Pending
- 実機での投稿作成フロー（画像アップロード含む）
- 実機での認証回帰（起動/再開/エラー）
- Nearby画面のスクロール・タブバー干渉確認

## Environment Risk
- この実行環境では `node` / `npm` / `npx` が見つからず、テストコマンドを実行できない。
