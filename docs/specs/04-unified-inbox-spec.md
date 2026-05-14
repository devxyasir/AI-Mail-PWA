# 04 — Unified Inbox Spec

## Goal

Merge email messages from all connected accounts into a single sorted inbox.

## Requirements

- Fetch messages from all connected provider adapters in parallel.
- Merge into a single array.
- Sort by `receivedAt` descending (newest first).
- Support filter by account (single account or all accounts).
- Support filter by label.
- Support search query.
- Support pagination (limit/offset).
- Cache results to avoid repeated provider API calls (TTL: 60 seconds).

## API

### GET /api/email/list

Request params:
```
accountId?: string    // Filter to one account, or omit for all
labelId?: string      // Filter by label
search?: string       // Search query
limit?: number        // Default 20
offset?: number       // Default 0
```

Response:
```typescript
{
  messages: NormalizedEmailMessage[]
  total: number
  hasMore: boolean
}
```

## Data Flow

1. Client calls `GET /api/email/list`
2. Route reads connected accounts from database
3. For each account, instantiates the correct provider adapter
4. Fetches messages in parallel with `Promise.all`
5. Normalizes all messages to `NormalizedEmailMessage`
6. Merges into single array
7. Sorts by `receivedAt` descending
8. Applies account/label/search filters
9. Returns paginated slice

## Edge Cases

- No accounts connected → return empty array with message
- One provider fails → return messages from other providers, flag error
- Provider returns 0 messages → include in merge as empty
- Duplicate messages (same `providerMessageId`) → deduplicate

## Acceptance Criteria

- [ ] Messages from all accounts appear in unified view
- [ ] Sorted by date (newest first)
- [ ] Account filter works
- [ ] Label filter works
- [ ] Search filter works
- [ ] Pagination works
- [ ] Provider failure degrades gracefully
- [ ] Unit tests pass with mocked providers