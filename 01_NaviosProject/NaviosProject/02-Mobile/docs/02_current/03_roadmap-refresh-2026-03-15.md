# Roadmap Refresh (2026-03-15 final)

## P0 — Auth
- [x] Auth guard + redirect
- [x] Login/Register/Logout with Supabase
- [x] 認証画面日本語化 + インラインバリデーション
- [ ] 実機での認証回帰テスト

## P1 — Core Features
- [x] Nearby feed: RPC + fallback + floating preview card
- [x] Post detail / comments read-write + auto pagination
- [x] Like persistence (post_likes table)
- [x] Post management (end / delete for author)
- [x] Create post: 3-step form + time picker + location fallback
- [x] Post image flow (Storage + optimization + post_images)
- [x] Search → Timeline conversion (SectionList, 3 filter tabs)
- [x] Pulse: teal theme, bottom floating search, compact hints
- [x] Profile: hero header, avatar upload, name edit, stats bar
- [x] カテゴリ名正式化（物資/イベント/近助/行政）

## P1 — Quality
- [x] Design tokens (constants/design.ts)
- [x] Color constants unified (Colors.teal/orange/purple)
- [x] Category color hardcodes removed
- [x] Skeleton loaders (Timeline, Profile)
- [x] PostCard responsive width
- [x] Haptic feedback (like, comment, share)

## P2 — Next Priority
1. **MapTiler地図表示** — MapView.tsx をMapTiler（ベクタータイル）ベースに実装 ← 最優先
2. **Google Places検索** — 投稿作成時の場所オートコンプリート
3. Runtime regression on real device
4. Comments optimistic update
5. Split create.tsx into sub-components (currently 1,406 lines)

## Dependencies
```bash
npx expo install expo-haptics expo-image-manipulator
```

## DB Setup Required
- `post_likes` table + RLS policies
- `avatars` Storage bucket (Public)

## Test Note
- Test execution blocked: `node`, `npm`, `npx` unavailable in this workspace.
