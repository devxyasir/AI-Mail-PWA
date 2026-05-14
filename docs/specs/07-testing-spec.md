# 07 — Testing Spec

## Goal

Ensure all critical features are tested with unit tests (Vitest) and e2e tests (Playwright).

## Test Categories

### Unit Tests (Vitest)

1. **Email Normalization** — `tests/unit/email-normalization.test.ts`
   - Gmail message normalizes to NormalizedEmailMessage
   - Microsoft Graph message normalizes correctly
   - IMAP message normalizes correctly
   - Missing fields fall back to defaults

2. **Unified Inbox** — `tests/unit/unified-inbox.test.ts`
   - Messages from two mock accounts are merged
   - Merged list is sorted by receivedAt descending
   - Account filter returns only matching messages
   - Label filter returns only matching messages
   - Search filter returns matching messages
   - Provider failure returns partial results, not full error

3. **AI Summary** — `tests/unit/ai-summary.test.ts`
   - buildSummaryPrompt returns string with subject and body
   - parseSummaryResponse trims whitespace
   - parseSummaryResponse returns fallback for empty response

4. **AI Reply Draft** — `tests/unit/ai-reply.test.ts`
   - buildReplyPrompt returns string with original email context
   - parseReplyResponse trims and returns draft
   - parseReplyResponse returns empty string for empty response

5. **Priority Scoring** — `tests/unit/priority-scoring.test.ts`
   - parsePriorityResponse converts score 0–25 to label "low"
   - parsePriorityResponse converts score 26–50 to label "medium"
   - parsePriorityResponse converts score 51–75 to label "high"
   - parsePriorityResponse converts score 76–100 to label "urgent"
   - parsePriorityResponse returns fallback for invalid response

### E2E Tests (Playwright)

1. **Inbox** — `tests/e2e/inbox.spec.ts`
   - Inbox page loads and shows email list
   - Clicking an email opens the detail view
   - AI summary appears in detail view

2. **Compose** — `tests/e2e/compose.spec.ts`
   - Compose button opens compose modal
   - Filling To, Subject, Body and clicking Send works

3. **Account Switcher** — `tests/e2e/account-switch.spec.ts`
   - Account switcher shows connected accounts
   - Selecting an account filters the inbox

## Mock Setup

All unit tests use mock providers from `tests/mocks/`.
No real API calls in any test.
Playwright tests run against the dev server with mock data.

## Commands

```bash
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright e2e tests
npm run test:all      # lint + test + build
```

## Acceptance Criteria

- [ ] All unit tests pass
- [ ] All e2e tests pass
- [ ] No real API calls in tests
- [ ] `npm run test:all` exits with code 0
- [ ] docs/testing.md documents results