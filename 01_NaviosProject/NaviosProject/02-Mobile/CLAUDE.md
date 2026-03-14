# CLAUDE.md

This file provides guidance for coding agents working in this repository.

## Project
- Name: NaviOs mobile app
- Stack: Expo + React Native + TypeScript + Expo Router
- Backend: Supabase (Auth, Postgres, PostGIS)

## Current Architecture (as of 2026-03-15)

### Routing
- `app/_layout.tsx`: root stack + auth guard
- `app/(tabs)/_layout.tsx`: tab layout (Pulse / 近く / + / タイムライン / マイページ)
- `app/(tabs)/index.tsx`: Pulse screen (AI search, teal theme)
- `app/(tabs)/nearby.tsx`: nearby feed + map placeholder + floating preview card
- `app/(tabs)/search.tsx`: Timeline screen (all posts chronological + category filter)
- `app/(tabs)/profile.tsx`: profile with avatar image upload + name edit
- `app/post/[id].tsx`: post detail + comments
- `app/post/create.tsx`: create post form (modern UI + time picker)
- `app/post/success.tsx`: post creation success page
- `app/auth/login.tsx`, `app/auth/register.tsx`: auth

### Data Layer
- `lib/supabase.ts`: Supabase client
- `lib/auth.ts`: auth actions (`signIn`, `signUp`, `signOut`)
- `lib/postService.ts`: post/comment API layer + `optimizeImage()`
  - `fetchPosts`, `fetchNearbyPostsByRpc`, `fetchPostById`
  - `fetchCommentsByPostId`, `createComment`, `createPost`
  - `optimizeImage(uri, maxSize, quality)` — resize + compress via expo-image-manipulator

### Hooks
- `hooks/useAuth.ts`: auth session state
- `hooks/usePosts.ts`: standard post list fetch
- `hooks/useNearbyPosts.ts`: RPC-based nearby fetch
- `hooks/useLocation.ts`: device location

### Categories
- 4 categories defined in `constants/categories.ts`
  - `stock`: 物資
  - `event`: イベント
  - `help`: 近助
  - `admin`: 行政

## Status Notes
- All tabs (Pulse, Nearby, Timeline, Profile) are Supabase-driven. No mock data remains.
- Nearby feed is RPC-based (`get_nearby_posts`) with floating preview card on pin tap.
- Profile supports avatar image upload (Storage `avatars` bucket) and display name edit.
- Create post has modern UI with 2x2 category grid and scroll-based time picker.
- Pulse uses teal color theme with bottom-floating search input.
- Timeline shows all posts chronologically with category filter (replaces old search tab).
- Image optimization applied: posts 800px, avatars 400px, quality 0.7.
- MapLibre map integration is NOT yet done (placeholder only).

## DB Expectations
- Main tables: `users`, `posts`, `post_details`, `comments`, `places`, `post_images`
- Storage buckets: `images` (post images), `avatars` (user avatars)
- RPC: `get_nearby_posts(user_lat, user_lng, radius_meters, category_filter)`
- Required env:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Working Rules
- Prefer changing service/hook layers over embedding Supabase queries in screens.
- Keep screen components focused on UI + interaction handling.
- Use TypeScript types from `types/index.ts`.
- Add user-visible error handling with `Alert` where relevant.
- Do not reintroduce mock data into migrated screens.
- Use `optimizeImage()` for any image uploads to keep file sizes manageable.

## Next Priorities
1. **MapLibre integration** — replace map placeholder with real map, real coordinate pins.
2. Runtime regression on real device (auth, post creation, image upload, avatar edit, timeline).
3. Comments pagination and optimistic update.
