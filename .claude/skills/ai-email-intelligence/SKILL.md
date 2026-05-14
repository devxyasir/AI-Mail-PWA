---
name: ai-email-intelligence
description: Use this skill when implementing AI email summaries, AI reply draft generation, priority scoring, thread insights, AI prompt templates, or AI output parsing.
---

# AI Email Intelligence Skill

## When to Use

Use this skill when:
- Implementing or modifying AI summary logic
- Building reply draft prompt templates
- Implementing priority scoring
- Parsing and validating AI API responses
- Adding AI API routes

## Step-by-Step Workflow

### Step 1 — Read the AI spec

```
Read docs/specs/05-ai-features-spec.md before writing any code.
```

### Step 2 — Design the prompt

Write the prompt template as a function that takes email data and returns a string.
Keep prompts focused and output-format specific.

Example for summary:
```
You are an email assistant. Summarize the following email in exactly 2-3 sentences.
Return ONLY the summary text. No preamble, no "Here is a summary".

Subject: {subject}
From: {from}
Body: {body}
```

### Step 3 — Call the AI API server-side

All AI calls must happen in API routes (`app/api/ai/`) or Server Actions.
Never call the AI API from client components.

```typescript
const response = await fetch(`${process.env.AI_BASE_URL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o-mini', // or your chosen model
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  })
})
```

### Step 4 — Parse and validate output

Never trust raw AI text. Parse and validate:
- Summary: trim whitespace, check length (max 500 chars)
- Reply draft: trim, check it is not empty, label as AI-generated
- Priority: parse score (0–100) and label (low/medium/high/urgent)

### Step 5 — Add fallback

If AI call fails, return a default:
- Summary: "Summary unavailable."
- Reply: empty string (user can write manually)
- Priority: { score: 50, label: 'medium' }

### Step 6 — Write tests

Test the prompt builder functions in isolation.
Test the output parsers with known AI responses.
Mock the AI API in tests — never call real AI in unit tests.

### Step 7 — Run and verify

```bash
npm run lint
npm run test
```

## Required Files to Inspect Before Starting

- `docs/specs/05-ai-features-spec.md`
- `lib/email/types.ts` (for email input type)
- `lib/ai/` (existing AI utilities)

## Implementation Rules

1. AI never sends emails. Draft only.
2. All AI calls are server-side.
3. Priority score is always 0–100 integer.
4. Priority label is always: low / medium / high / urgent.
5. Summary is always max 3 sentences.
6. Always handle AI API errors gracefully.

## Acceptance Criteria

- [ ] Summary returns 2-3 sentences or fallback
- [ ] Reply returns draft string or empty string
- [ ] Priority returns { score: number, label: string }
- [ ] No AI API calls in client components
- [ ] Fallback exists for all three features
- [ ] Unit tests for prompt builders pass
- [ ] Unit tests for output parsers pass

## Example Prompts

```
Use the ai-inbox agent and ai-email-intelligence skill.
Read docs/specs/05-ai-features-spec.md first.
Implement lib/ai/summarize.ts with a buildSummaryPrompt function and a parseSummaryResponse function.
Implement app/api/ai/summarize/route.ts that accepts { emailId, body, subject } and returns { summary }.
Add fallback if AI fails.
Write tests in tests/unit/ai-summary.test.ts.
Run npm run test and fix failures.
```