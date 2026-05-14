# spec-feature

## Purpose

Write or update a spec file for a feature in `docs/specs/`.

## When to Use

Use this command when:
- Starting a new feature and no spec exists yet
- Refining an existing spec based on new requirements
- Checking if a feature belongs in the product

## Agent to Use

product-architect

## Steps

1. Read CLAUDE.md to confirm scope.
2. Read existing specs in docs/specs/ to avoid duplication.
3. Identify which spec file this belongs in.
4. Write or update the spec with:
   - Goal
   - User stories
   - Requirements list
   - Non-goals
   - Data model (TypeScript types)
   - API behavior
   - UI behavior
   - Edge cases
   - Test cases
   - Acceptance criteria
5. Confirm the feature does not violate scope (no contacts/calendar/tasks/notes).
6. Save to docs/specs/ with the correct numbered filename.

## Output Format

A complete spec file in docs/specs/ with all sections filled in.

## Usage Example
/spec-feature unified inbox merge logic for multiple email accounts
