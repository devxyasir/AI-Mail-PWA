# review-security

## Purpose

Run a security review on the codebase or a specific module.

## Agent to Use

security

## Skill to Use

security-review

## Steps

1. Read docs/specs/06-security-spec.md.
2. Read CLAUDE.md security rules.
3. Grep for tokens in client code:
   grep -r "process.env" components/
4. Check all API routes for Zod validation.
5. Check credential storage in lib/security/encrypt.ts.
6. Check session cookie configuration.
7. Check for sensitive console.log statements.
8. Write findings to docs/security-review.md.
9. Fix all Critical and High issues.
10. List remaining Low/Medium risks.

## Output Format

- docs/security-review.md with findings and fixes
- Fixed source files for Critical issues

## Tests to Run

```bash
npm run lint
npm run test
npm run build
```

## Usage Example
/review-security full codebase before deployment

