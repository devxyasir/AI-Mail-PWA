---
name: email-provider-integration
description: Use this skill when implementing Gmail API, Microsoft Graph API, IMAP adapters, email normalization, provider interfaces, or adding any email provider operation.
---

# Email Provider Integration Skill

## When to Use

Use this skill when:
- Implementing a new email provider adapter
- Adding a new operation (archive, search, labels) to an existing adapter
- Creating or updating the `EmailProviderAdapter` interface
- Normalizing provider-specific data into `NormalizedEmailMessage`
- Writing mock providers for tests

## Step-by-Step Workflow

### Step 1 — Read specs first

```
Read docs/specs/03-email-provider-spec.md before writing any code.
```

### Step 2 — Review the interface

Check `lib/email/provider-adapter.ts` to see the current adapter interface.
Do not break the interface contract.

### Step 3 — Review the normalized type

Check `lib/email/types.ts` to see `NormalizedEmailMessage`.
Every adapter output must match this type exactly.

### Step 4 — Implement the adapter

Place provider code in `lib/email/providers/<provider>.ts`.

Required methods:
- `listMessages(options)` → `Promise<NormalizedEmailMessage[]>`
- `getMessage(id)` → `Promise<NormalizedEmailMessage>`
- `sendMessage(draft)` → `Promise<void>`
- `replyMessage(id, draft)` → `Promise<void>`
- `forwardMessage(id, draft)` → `Promise<void>`
- `archiveMessage(id)` → `Promise<void>`
- `deleteMessage(id)` → `Promise<void>`
- `searchMessages(query)` → `Promise<NormalizedEmailMessage[]>`
- `listLabels()` → `Promise<EmailLabel[]>`

### Step 5 — Normalize carefully

Map every field from the provider's API to `NormalizedEmailMessage`.
Handle missing fields with defaults (empty array, empty string).
Never pass provider-specific field names outside the adapter file.

### Step 6 — Write a mock

Create `tests/mocks/<provider>-provider.mock.ts` that returns hardcoded
`NormalizedEmailMessage` objects. This lets tests run without real API calls.

### Step 7 — Write normalization tests

In `tests/unit/email-normalization.test.ts`, test that:
- Raw Gmail API response normalizes correctly
- Raw Microsoft Graph response normalizes correctly
- Raw IMAP message normalizes correctly
- Missing fields fall back to defaults

### Step 8 — Run and verify

```bash
npm run lint
npm run test
npm run build
```

## Required Files to Inspect Before Starting

- `lib/email/types.ts`
- `lib/email/provider-adapter.ts`
- `docs/specs/03-email-provider-spec.md`

## Implementation Rules

1. Adapter file must only export the adapter class and its types.
2. No OAuth token logic in the adapter — pass token in constructor.
3. Always handle 401/403 errors and throw a typed `AuthError`.
4. Always handle network errors and throw a typed `ProviderError`.
5. Use TypeScript strict mode throughout.

## Acceptance Criteria

- [ ] Adapter implements `EmailProviderAdapter` interface
- [ ] All methods return correct types
- [ ] Mock adapter exists
- [ ] Normalization tests pass
- [ ] No raw provider types outside `lib/email/providers/`

## Example Prompts

```
Use the email-integration agent and email-provider-integration skill.
Read docs/specs/03-email-provider-spec.md first.
Implement GmailAdapter in lib/email/providers/gmail.ts.
It must implement all EmailProviderAdapter methods and return NormalizedEmailMessage.
Write a mock in tests/mocks/gmail-provider.mock.ts.
Write tests in tests/unit/email-normalization.test.ts.
Run npm run test and fix failures.
```