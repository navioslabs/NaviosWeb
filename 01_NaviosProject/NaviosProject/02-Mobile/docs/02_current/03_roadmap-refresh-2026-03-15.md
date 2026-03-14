# Roadmap Refresh (2026-03-15)

## P0 Status
- [x] Auth guard + redirect
- [x] Login/Register/Logout with Supabase
- [ ] 実機での認証回帰テスト（起動・再開・失敗系）

## P1 Status
- [x] Nearby feed: RPC + fallback feed
- [x] Post detail / comments read-write
- [x] Create post insert (`posts`, `post_details`)
- [x] Search mock -> Supabase migration
- [x] Pulse mock -> Supabase migration
- [x] Post image flow (Storage + `post_images`)
- [x] カテゴリ名正式化（物資/イベント/近助/行政）
- [x] マイページ: アバター画像アップロード + ユーザー名編集
- [x] 投稿画面: モダンUI + 時刻ピッカー
- [x] Pulse画面: カラー変更 + レイアウト改善
- [x] 検索→タイムライン画面変換

## UI/UX Fixes Done
- Login screen tagline removed
- Nearby hot cards: long-title layout hardening
- Major mojibake cleanup
- Create screen: 2x2カテゴリグリッド、時刻ピッカー、モダンレイアウト
- Calendar picker for event date / deadline
- Post success page (`/post/success`)
- Nearby: フローティングプレビューカード
- Profile: アバター画像化 + カメラオーバーレイ + ユーザー名インライン編集
- Pulse: ヘッダー削除、検索ボックス下部移動、ティール系カラー
- 画像最適化: `optimizeImage()` (投稿800px / アバター400px)
- タブバー: 検索→タイムライン（アイコン・ラベル変更）

## Next Priority (P2)
1. **MapLibre integration for Nearby map** ← 最優先。フローティングカードは実装済み
2. Runtime regression pass on real device（全画面）
3. Comments pagination and optimistic update

## Dependencies to Install
```bash
npx expo install expo-image-manipulator
```

## Test Note
- Test execution in this workspace is blocked because `node`, `npm`, and `npx` are unavailable.
