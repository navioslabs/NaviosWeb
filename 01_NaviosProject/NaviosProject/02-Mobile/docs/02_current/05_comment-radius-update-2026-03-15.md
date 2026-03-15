# Comment Radius Update (2026-03-15)

## Summary
- Updated the comment/chat availability radius from **500m** to **150m** to better emphasize "nearby" interactions.

## Changed File
- `app/post/[id].tsx`

## Code Change
- Before: `const CHAT_RADIUS_METERS = 500;`
- After: `const CHAT_RADIUS_METERS = 150;`

## Behavior Impact
- Users can post comments only when they are within **150m** of the post location.
- The remaining-distance message now uses the 150m threshold.
- Post owner comment permissions are unchanged (owner can still comment regardless of distance).

## Verification
1. Open a post detail screen.
2. Confirm comment input is enabled within 150m.
3. Confirm comment input is disabled and remaining-distance hint appears beyond 150m.
