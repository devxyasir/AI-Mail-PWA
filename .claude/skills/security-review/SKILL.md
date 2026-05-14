---
name: security-review
description: Use this skill when reviewing codebase security, checking for token leaks, validating input validation coverage, reviewing credential storage, scanning for console.log secrets, or producing the security review document.
---

# Security Review Skill

## When to Use

Use this skill when:
- Conducting a full security audit before deployment
- Reviewing a specific module for token safety
- Checking API routes for missing Zod validation
- Producing `docs/security-review.md`

## Step-by-Step Workflow

### Step 1 — Read the security spec

```
Read docs/specs/06-security-spec.md before reviewing.
```

### Step 2 — Scan for secrets in client code

Grep for these patterns in `components/`, `app/(app)/`, and `app/auth/`:

```bash
grep -r "process.env" components/
grep -r "API_KEY\|CLIENT_SECRET\|TOKEN" components/
grep -r "console.log" lib/email/providers/
```

Flag any result that shows tokens or secrets in client-accessible files.

### Step 3 — Check API route validation

For every file in `app/api/`, verify:
- Input is parsed with `zod.parse()` or `zod.safeParse()`
- Invalid input returns 400 with error message
- No unvalidated query params or body fields are used

### Step 4 — Check credential storage

In `lib/security/encrypt.ts`, verify:
- `CREDENTIAL_ENCRYPTION_KEY` is from environment variable
- AES-256 or similar encryption is used
- IV is random per encryption
- Encrypted credentials are stored in DB, not plaintext

### Step 5 — Check session cookies

In NextAuth configuration, verify:
- `httpOnly: true`
- `secure: true` (or `process.env.NODE_ENV === 'production'`)
- `sameSite: 'lax'` or `'strict'`

### Step 6 — Document findings

Write `docs/security-review.md` with:
- Issues found (critical / medium / low)
- Issues fixed
- Remaining risks and mitigations
- Summary verdict

### Step 7 — Fix critical issues

Fix any Critical or High severity issues before marking complete.

## Acceptance Criteria

- [ ] No tokens in client-side code
- [ ] No hardcoded secrets
- [ ] All API routes have Zod validation
- [ ] Credentials are encrypted at rest
- [ ] Session cookies are httpOnly + secure
- [ ] No sensitive data in console.log
- [ ] `docs/security-review.md` is written

## Example Prompts

```
Use the security agent and security-review skill.
Read docs/specs/06-security-spec.md first.
Review the full codebase for token leaks, missing Zod validation, and insecure logging.
Fix all Critical issues.
Write docs/security-review.md with your findings.
```