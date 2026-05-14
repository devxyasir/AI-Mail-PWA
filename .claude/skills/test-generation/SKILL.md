---
name: test-generation
description: Use this skill when writing Vitest unit tests, Playwright e2e tests, creating provider mocks, setting up test infrastructure, or filling test coverage gaps.
---

# Test Generation Skill

## When to Use

Use this skill when:
- Writing unit tests for any module
- Writing Playwright e2e tests
- Creating mock providers or mock AI responses
- Running the full test suite and fixing failures

## Step-by-Step Workflow

### Step 1 — Read the testing spec

```
Read docs/specs/07-testing-spec.md before writing tests.
```

### Step 2 — Identify what to test

For each module, test:
- The happy path (valid inputs, expected output)
- Edge cases (empty arrays, null values, malformed data)
- Error paths (API failures, network errors)

### Step 3 — Vitest unit test pattern

```typescript
import { describe, it, expect, vi } from 'vitest'
import { normalizeGmailMessage } from '../../lib/email/providers/gmail'
import { mockGmailMessage } from '../mocks/gmail-provider.mock'

describe('Gmail normalization', () => {
  it('normalizes a standard Gmail message correctly', () => {
    const result = normalizeGmailMessage(mockGmailMessage)
    expect(result.id).toBeDefined()
    expect(result.provider).toBe('gmail')
    expect(result.from).toBeTruthy()
    expect(Array.isArray(result.labels)).toBe(true)
  })

  it('handles missing snippet with empty string', () => {
    const msg = { ...mockGmailMessage, snippet: undefined }
    const result = normalizeGmailMessage(msg)
    expect(result.snippet).toBe('')
  })
})
```

### Step 4 — Mock provider pattern

```typescript
// tests/mocks/gmail-provider.mock.ts
import type { NormalizedEmailMessage } from '../../lib/email/types'

export const mockNormalizedEmail: NormalizedEmailMessage = {
  id: 'test-id-1',
  accountId: 'account-1',
  provider: 'gmail',
  providerMessageId: 'gmail-msg-1',
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  subject: 'Test Email Subject',
  snippet: 'This is the email snippet...',
  body: 'Full email body content here.',
  receivedAt: '2024-01-15T10:00:00Z',
  labels: ['INBOX'],
  isRead: false,
  isArchived: false,
}

export const mockGmailAdapter = {
  listMessages: vi.fn().mockResolvedValue([mockNormalizedEmail]),
  getMessage: vi.fn().mockResolvedValue(mockNormalizedEmail),
  sendMessage: vi.fn().mockResolvedValue(undefined),
  replyMessage: vi.fn().mockResolvedValue(undefined),
  forwardMessage: vi.fn().mockResolvedValue(undefined),
  archiveMessage: vi.fn().mockResolvedValue(undefined),
  deleteMessage: vi.fn().mockResolvedValue(undefined),
  searchMessages: vi.fn().mockResolvedValue([mockNormalizedEmail]),
  listLabels: vi.fn().mockResolvedValue([{ id: 'INBOX', name: 'Inbox' }]),
}
```

### Step 5 — Playwright e2e pattern

```typescript
// tests/e2e/inbox.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Inbox', () => {
  test('shows inbox list with mock data', async ({ page }) => {
    await page.goto('/inbox')
    await expect(page.getByTestId('inbox-list')).toBeVisible()
    await expect(page.getByTestId('inbox-item')).toHaveCount.greaterThan(0)
  })

  test('opens email detail on click', async ({ page }) => {
    await page.goto('/inbox')
    await page.getByTestId('inbox-item').first().click()
    await expect(page.getByTestId('email-detail')).toBeVisible()
  })
})
```

### Step 6 — Run all tests

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

Fix any failures. Do not skip tests.

## Acceptance Criteria

- [ ] All unit tests pass
- [ ] All e2e tests pass
- [ ] No real API calls in tests
- [ ] Mock providers exist for all three email providers
- [ ] `npm run test:all` exits with code 0

## Example Prompts

```
Use the testing agent and test-generation skill.
Read docs/specs/07-testing-spec.md first.
Write unit tests for lib/email/providers/gmail.ts normalization functions.
Create tests/mocks/gmail-provider.mock.ts with mock data and mock adapter.
Write tests in tests/unit/email-normalization.test.ts.
Run npm run test and fix all failures.
```