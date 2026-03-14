# Roadmap Refresh (2026-03-14, updated)

## Current Status
- Auth guard added in `app/_layout.tsx` with redirect logic.
- Login/Register screens are wired to Supabase auth (`lib/auth.ts`).
- Infinite spinner mitigation added in `hooks/useAuth.ts` (error/timeout-safe loading release).
- Supabase client has RN storage config and env fail-safe (`lib/supabase.ts`).
- Expo Go tunnel run confirmed by user.

## What Was Verified
- `.env` format is valid (keys are present, no hidden invalid bytes).
- Supabase endpoint reachability verified from terminal:
  - `curl -i https://xkndguwbizgohfdjoisf.supabase.co/rest/v1/` returned `401` with `No API key found`.
  - This means network path to Supabase is OK.

## P0 Progress
- [x] Auth state guard in root layout.
- [x] Login flow connected to `signInWithPassword`.
- [x] Register flow connected to `signUp` + profile upsert to `public.users`.
- [x] Submitting/loading control for auth buttons.
- [x] Logout button wired to Supabase sign-out in `app/(tabs)/profile.tsx`.
- [ ] Real-device regression pass for:
  - cold start
  - app resume
  - logout -> login
  - failed login/register error display

## Execution Update (2026-03-14)
- Implemented P1 start:
  - `hooks/usePosts.ts` now fetches from Supabase `posts` table (with joins to `users`, `places`, `post_details`, `post_images`, `comments`) and maps to app `Post` model.
  - `app/(tabs)/nearby.tsx` switched from `MOCK_POSTS` to `usePosts()`.
- Added P0 support fix:
  - Profile logout button now calls `signOut()` with submit-lock and error alert.
- Verification status in this workspace:
  - Source-level verification: completed.
  - Runtime verification (`expo` launch / device regression): blocked because `node`, `npm`, and `npx` are not installed in the current execution environment.

## Next Priority (P1)
1. Replace mock post fetching with Supabase queries (`hooks/usePosts.ts`). ✅
2. Connect nearby feed to `get_nearby_posts` RPC. ✅
3. Connect post detail + comments read/write. ✅
4. Connect create post screen to DB insert. ✅

## Latest Implementation (2026-03-14)
- Added `lib/postService.ts` for post/comment data access.
- Nearby now uses RPC-based feed (`useNearbyPosts`).
- Post detail now reads post/comments from Supabase.
- Comment send is connected to `comments` insert.
- Create post now inserts into `posts` and `post_details`.

## Known Workspace Notes
- There is an untracked temp file: `app/_tmp_write_test.txt`.
- It may be locked by editor/metro process; remove when lock is released.

## Restart Checklist (for next session)
1. `npx expo start -c --tunnel`
2. Fully restart Expo Go
3. Verify route behavior:
   - logged-out -> `/auth/login`
   - logged-in -> `/(tabs)`
4. Verify auth API behavior with a real test account
