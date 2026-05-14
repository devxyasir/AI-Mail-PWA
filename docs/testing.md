# Testing Documentation

## Test Strategy

The project uses two test layers:

1. **Unit Tests (Vitest)** — Test isolated functions and logic without external dependencies.
2. **E2E Tests (Playwright)** — Test user flows through the browser against the dev server.

All external APIs (Gmail, Microsoft Graph, IMAP, AI) are mocked in unit tests.

## Test Files

### Unit Tests

| File | Tests |
|------|-------|
| `tests/unit/email-normalization.test.ts` | Gmail/Microsoft/IMAP normalization |
| `tests/unit/unified-inbox.test.ts` | Inbox merge, sort, filter logic |
| `tests/unit/ai-summary.test.ts` | Prompt builder, response parser |
| `tests/unit/ai-reply.test.ts` | Reply prompt builder, parser |
| `tests/unit/priority-scoring.test.ts` | Score-to-label conversion |

### E2E Tests

| File | Tests |
|------|-------|
| `tests/e2e/inbox.spec.ts` | Inbox loads, email opens, summary appears |
| `tests/e2e/compose.spec.ts` | Compose modal, form submission |
| `tests/e2e/account-switch.spec.ts` | Account switcher |

### Mocks

| File | Purpose |
|------|---------|
| `tests/mocks/gmail-provider.mock.ts` | Gmail mock data + mock adapter |
| `tests/mocks/microsoft-provider.mock.ts` | Microsoft mock data + mock adapter |
| `tests/mocks/imap-provider.mock.ts` | IMAP mock data + mock adapter |

## Running Tests

```bash
npm run test           # Vitest unit tests
npm run test:watch     # Vitest in watch mode
npm run test:e2e       # Playwright e2e tests
npm run test:all       # lint + unit tests + build
```

## Acceptance

All tests must pass before deployment.
`npm run test:all` must exit with code 0.