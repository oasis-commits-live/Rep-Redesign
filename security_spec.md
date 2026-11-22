# Rep Firestore Security Specification

## Data Invariants

1. **PII Isolation**: User email addresses and body metrics (`heightCm`, `weightKg`) live exclusively in `/users/{userId}` and are strictly readable and writable only by `request.auth.uid == userId` with `email_verified == true`. Public collections (`/profiles`, `/usernames`, `/activities`, `/follows`) contain zero PII.
2. **Verified Identity**: All database reads and writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Owner Isolation for Private Data**: Subcollections under `/users/{userId}` (`templates`, `sessions`, `customExercises`, `savedTemplates`) verify parent existence via `exists(/databases/$(database)/documents/users/$(userId))` on single-doc operations and enforce `resource.data.userId == request.auth.uid` on `list`.
4. **Atomic Username Reservation**: `/usernames/{username}` cannot be overwritten or stolen by another user; creation requires `incoming().userId == request.auth.uid`, valid handle regex `^[a-z0-9._]+$` (3-20 chars), and `createdAt == request.time`.
5. **Atomic Social Counters**: Creating or deleting a like in `/activities/{activityId}/likes/{likerId}` or a comment in `/activities/{activityId}/comments/{commentId}` requires the parent `/activities/{activityId}` to exist and atomically updates `likesCount` / `commentsCount` in the same batch (`getAfter`).
6. **Strict Keys, Types, Bounds, and Immutability**: Every create enforces `hasAll` + `hasOnly` and `createdAt == request.time`; every update runs `isValid[Entity](incoming())`, restricts `affectedKeys().hasOnly(...)` per action, preserves immutable fields (`userId`, `createdAt`), and enforces `updatedAt == request.time`.

## The "Dirty Dozen" Adversarial Payloads

All 12 payloads below MUST be rejected (`PERMISSION_DENIED`):

1. **PII Snooping (Read `/users/victim-uid` as attacker)**: Authenticated user attempts `get` on another user's `/users/{userId}` document containing their email.
2. **Unverified Account Write**: User with `email_verified: false` attempts to create `/users/{uid}`.
3. **Shadow Field Injection on Profile**: Owner attempts to write `{ ..., isAdmin: true }` to `/profiles/{uid}` or `/users/{uid}`.
4. **Identity Spoofing on Activity**: Attacker creates `/activities/act-1` with `userId: "victim-uid"` instead of `request.auth.uid`.
5. **Username Hijacking**: Attacker attempts `update` or `delete` on `/usernames/alex` owned by another user.
6. **Oversized String / ID Poisoning**: Attacker creates a template with a 200-char ID or 500-char name exceeding bounds.
7. **Timestamp Forgery**: Attacker creates `/activities/act-2` with a backdated client timestamp instead of `request.time`.
8. **Immutable Field Tampering**: Owner attempts to update `createdAt` or `userId` on their own `/users/{uid}` or `/activities/{id}`.
9. **Unsynchronized Like Inflation**: Attacker updates `likesCount` on `/activities/act-1` by `+10` (or `+1` without creating `/activities/act-1/likes/{uid}` in the same batch).
10. **Orphaned Comment Write**: Attacker creates `/activities/nonexistent-id/comments/c1` where the parent activity does not exist.
11. **Unbounded Array Injection**: Owner attempts to save a template with > 100 exercises or non-map array items.
12. **Blanket List Scraping**: Attacker runs an unfiltered `list` query on `/users` or attempts to `list` another user's `/users/victim-uid/sessions`.
