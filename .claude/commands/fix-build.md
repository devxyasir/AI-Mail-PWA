# fix-build

## Purpose

Fix lint errors, test failures, or build errors.

## Agent to Use

- Use backend-api agent for API/TypeScript errors
- Use testing agent for test failures
- Use ui-ux agent for component/CSS errors

## Steps

1. Run: npm run lint — note all errors
2. Run: npm run test — note all failures
3. Run: npm run build — note all build errors
4. Fix errors in this priority order:
   - TypeScript type errors (break the build)
   - Missing imports
   - Test failures
   - Lint warnings
5. Re-run all three commands after each fix.
6. Do not comment out failing tests — fix them.
7. Do not use `@ts-ignore` unless absolutely required with justification.

## Output Format

- Fixed source files
- All three commands exit with code 0

## Usage Example
/fix-build TypeScript errors in lib/email/providers/gmail.ts

