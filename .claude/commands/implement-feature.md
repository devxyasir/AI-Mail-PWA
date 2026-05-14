# implement-feature

## Purpose

Implement a specific feature from a spec.

## When to Use

Use this command when:
- A spec exists in docs/specs/ and is ready to implement
- A feature needs to be added or extended

## Agent to Use

Choose based on feature type:
- UI feature → ui-ux agent
- Email provider → email-integration agent
- API / database → backend-api agent
- AI feature → ai-inbox agent

## Skill to Use

Choose based on feature type:
- Email adapter → email-provider-integration skill
- AI feature → ai-email-intelligence skill
- UI component → mobile-pwa-ui skill
- Deployment → deployment skill

## Steps

1. Read the relevant spec in docs/specs/.
2. Identify the correct agent and skill.
3. Write a 3-5 line implementation plan.
4. Implement ONLY the feature in scope. Nothing extra.
5. Add unit tests and/or Playwright tests.
6. Run: npm run lint
7. Run: npm run test
8. Run: npm run build
9. Fix any failures.
10. Update docs/ if architecture changed.

## Output Format

- Modified/created source files
- New test files
- Updated docs if needed

## Constraints

- Do not add contacts, calendar, tasks, or notes.
- Do not break existing tests.
- Do not skip tests.

## Usage Example
/implement-feature Gmail adapter for listing and normalizing messages

