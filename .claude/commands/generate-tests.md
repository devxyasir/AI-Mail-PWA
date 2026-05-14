# generate-tests

## Purpose

Generate missing tests or fill test coverage gaps.

## Agent to Use

testing

## Skill to Use

test-generation

## Steps

1. Read docs/specs/07-testing-spec.md.
2. Identify which modules are missing tests.
3. Write unit tests for:
   - Email normalization
   - Unified inbox merge logic
   - AI prompt builders
   - AI output parsers
   - Priority scoring
4. Write Playwright tests for:
   - Inbox list loads
   - Email detail opens
   - Compose modal opens
   - Account switcher works
5. Create or update mock providers in tests/mocks/.
6. Run: npm run test
7. Run: npm run test:e2e
8. Fix all failures.

## Output Format

- New test files in tests/unit/ and tests/e2e/
- Mock files in tests/mocks/
- docs/testing.md updated with results

## Tests to Run

```bash
npm run lint
npm run test
npm run test:e2e
```

## Usage Example
/generate-tests all missing unit tests for email normalization and AI features

