# Roadmap Refresh (2026-03-14, updated after UI/Data migration)

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

## UI/UX Fixes Done
- Login screen tagline `Community Info App` removed
- Nearby hot cards: long-title layout hardening
- Major mojibake cleanup in user-facing texts
- Create screen placeholders rewritten in Japanese
- Calendar picker for event date / deadline
- New post success page (`/post/success`)

## Next Priority (P2)
1. MapLibre integration for Nearby map
2. Runtime regression pass on real device
3. Comments pagination and optimistic update

## Test Note
- Test execution in this workspace is blocked because `node`, `npm`, and `npx` are unavailable.
