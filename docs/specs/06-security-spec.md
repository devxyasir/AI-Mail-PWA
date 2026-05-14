# 06 — Security Spec

## Goal

Ensure OAuth tokens, IMAP passwords, AI keys, and session data are handled securely.

## Requirements

### Authentication
- Use NextAuth v5 for OAuth (Gmail, Microsoft).
- Session tokens stored as httpOnly, secure cookies.
- JWT secret from `NEXTAUTH_SECRET` environment variable.

### OAuth Token Storage
- Access tokens and refresh tokens stored encrypted in database.
- Encryption: AES-256-GCM using `CREDENTIAL_ENCRYPTION_KEY`.
- Tokens never returned to client in API responses.
- Tokens never logged with console.log or any logger.

### IMAP Credentials
- Username and password stored encrypted in database.
- Same AES-256-GCM encryption as OAuth tokens.
- Password never visible in client code.
- Password never logged.

### API Input Validation
- All API route inputs validated with Zod.
- Invalid input → HTTP 400 with error message.
- No unvalidated query params or body fields used in logic.

### Environment Variables
- All secrets in `.env.local` (local) or Vercel environment variables (production).
- `.env.local` is in `.gitignore`.
- No hardcoded secrets in any source file.

### Rate Limiting
- AI API routes limited to 10 requests per minute per user.
- Provider API routes limited to 30 requests per minute per user.

## Threat Model

| Threat | Mitigation |
|--------|------------|
| Token in client code | Server-only API routes; no tokens in client components |
| Token in logs | Never log tokens; review all console.log calls |
| IMAP password leak | Encrypted at rest; never returned to client |
| CSRF attack | NextAuth CSRF protection; SameSite cookies |
| Injection | Zod validation on all inputs |
| Brute force | Rate limiting on auth routes |

## Acceptance Criteria

- [ ] No tokens in client components
- [ ] No hardcoded secrets
- [ ] All API inputs have Zod validation
- [ ] Credentials encrypted at rest
- [ ] Session cookies are httpOnly + secure
- [ ] No sensitive data in console.log
- [ ] `docs/security-review.md` documents all findings