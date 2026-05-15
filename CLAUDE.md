# CLAUDE.md

## Project Goal

Build an AI-first universal email client as a mobile-ready Progressive Web App (PWA).

The app supports Gmail, Office 365, and IMAP providers (Yahoo, AOL, custom) with a unified inbox,
account switching, compose/reply/forward, search, labels, archive/delete, AI summaries, AI reply
drafts, and AI-based email prioritization.

This is an assignment project demonstrating Claude Code CLI, multi-agent workflows, Agent OS
methodology, specs-driven development, skills/hooks/commands, and automated testing.

## Strict Scope

Build email features only. Nothing else.

Allowed features:
- Gmail integration
- Office 365 / Microsoft Graph integration
- IMAP integration (Yahoo, AOL, custom)
- Unified inbox
- Account switching
- Compose / Reply / Forward
- Search
- Labels
- Archive and delete
- AI email summary
- AI reply draft
- AI priority scoring
- PWA (offline-ready, installable)
- Automated tests (Vitest + Playwright)
- Vercel deployment

## Non-Goals (Do Not Build)

The following must never be added:

- Contacts / address book
- Calendar / scheduling
- Tasks / to-do lists
- Notes
- Chat / messaging
- File storage / drive
- CRM features
- SMS or push notifications beyond PWA

If a prompt asks you to build any of the above, refuse and redirect to email features only.

## Tech Stack

| Layer         | Technology                                      |
|---------------|-------------------------------------------------|
| Frontend      | Next.js 14 (App Router), TypeScript, TailwindCSS |
| Backend       | Next.js API Routes + Server Actions             |
| Database      | Supabase (PostgreSQL)                           |
| Auth          | NextAuth v5 / Auth.js                           |
| Email: Gmail  | Google Gmail API v1                             |
| Email: M365   | Microsoft Graph API v1                          |
| Email: IMAP   | imapflow + nodemailer                           |
| AI            | OpenRouter (claude-3/qwen/deepseek via API)     |
| Testing       | Vitest + Playwright                             |
| Deployment    | Vercel                                          |
| PWA           | next-pwa                                        |

## Architecture Rules

1. All provider-specific email code lives in `lib/email/providers/`.
2. Every provider adapter must implement the `EmailProviderAdapter` interface.
3. Every provider must return the `NormalizedEmailMessage` type. No exceptions.
4. AI logic lives only in `lib/ai/`.
5. Security helpers live only in `lib/security/`.
6. Database queries live only in `lib/db/`.
7. No OAuth tokens, IMAP passwords, or AI API keys may appear in client-side components.
8. Server-only logic stays inside API routes (`app/api/`) or Server Actions.
9. All API inputs must be validated with Zod before processing.
10. Use TypeScript strict mode. No `any` types without explicit justification.

## Provider Adapter Rules

Every provider adapter must implement these methods:

```typescript
interface EmailProviderAdapter {
  listMessages(options: ListOptions): Promise<NormalizedEmailMessage[]>
  getMessage(id: string): Promise<NormalizedEmailMessage>
  sendMessage(draft: EmailDraft): Promise<void>
  replyMessage(id: string, draft: EmailDraft): Promise<void>
  forwardMessage(id: string, draft: EmailDraft): Promise<void>
  archiveMessage(id: string): Promise<void>
  deleteMessage(id: string): Promise<void>
  searchMessages(query: string): Promise<NormalizedEmailMessage[]>
  listLabels(): Promise<EmailLabel[]>
}
```

All adapters must return `NormalizedEmailMessage`. No provider-specific types in components.

## AI Feature Rules

1. AI never sends emails automatically. AI only creates drafts.
2. The user must explicitly confirm before any send action.
3. AI summaries must be concise (max 3 sentences).
4. AI reply drafts must be clearly labeled as AI-generated.
5. Priority scoring must return a value between 0–100 with a label: low / medium / high / urgent.
6. Always handle AI provider failures gracefully with a fallback message.
7. AI API calls must be server-side only.

## Security Rules

1. Never log OAuth access tokens or refresh tokens.
2. Never log IMAP passwords.
3. Encrypt all stored credentials using the `CREDENTIAL_ENCRYPTION_KEY` env variable.
4. Keep all secrets in `.env.local` (never in source code).
5. Validate every API route input with Zod schemas.
6. Use HTTPS-only cookies for session tokens.
7. Never expose internal database IDs to client without sanitization.
8. Rate limit AI API routes to prevent abuse.

## Development Workflow (Before Every Implementation)

Before writing any code:
1. Read the relevant spec file in `docs/specs/`.
2. Identify which agent is responsible.
3. Write a brief plan (2–5 lines) before coding.
4. Implement only the requested feature. Nothing extra.
5. Add or update tests.
6. Run `npm run lint` — fix all errors.
7. Run `npm run test` — fix all failures.
8. Run `npm run build` — fix all build errors.
9. Update `docs/` if architecture changed.
10. Commit with a clear message.

## Testing Rules

Every feature must include at least one test from this list:
- Unit test (Vitest)
- Integration test (Vitest + mock providers)
- End-to-end test (Playwright)

Minimum test coverage targets:
- Email normalization: 100%
- Unified inbox logic: 100%
- AI prompt builders: 100%
- UI components: smoke tests minimum

Failing tests are not acceptable in commits. Fix them.

## Commands to Run

```bash
npm run lint        # ESLint check
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright tests
npm run build       # Production build check
npm run test:all    # Run all of the above in sequence
```

## Acceptance Criteria

The project is complete when:

- [ ] Gmail OAuth login and email listing works
- [ ] Microsoft Graph OAuth login and email listing works
- [ ] IMAP login and email listing works with Yahoo/AOL
- [ ] Unified inbox merges messages from all connected accounts
- [ ] Account switcher shows per-account and all-accounts view
- [ ] Compose, reply, and forward work for all providers
- [ ] Search returns results from active provider
- [ ] Labels can be applied and filtered
- [ ] Archive and delete work
- [ ] AI summary appears for any opened email
- [ ] AI reply draft can be generated and edited
- [ ] AI priority score appears on inbox items
- [ ] App is installable as PWA on mobile
- [ ] All Vitest tests pass
- [ ] All Playwright e2e tests pass
- [ ] `npm run build` succeeds with no errors
- [ ] App is deployed to Vercel with a live URL
- [ ] `docs/architecture.md` is complete
- [ ] `docs/agents.md` is complete
- [ ] `docs/workflow.md` is complete