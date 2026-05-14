# 05 — AI Features Spec

## Goal

Add AI-powered email intelligence: summaries, reply drafts, and priority scoring.
AI is assistive only — never automatic. User must confirm all actions.

## Features

### 1. Email Summary

Triggered automatically when a user opens an email.

Input: `{ subject, from, body }`
Output: `{ summary: string }` — 2-3 sentences max

Prompt template:
```
You are a helpful email assistant. Summarize the following email in 2-3 clear sentences.
Be concise. Focus on the main point and any action required.
Return only the summary. No preamble.

From: {from}
Subject: {subject}
Body: {body}
```

Fallback: "Summary unavailable."

### 2. Reply Draft

Triggered by user clicking "Generate AI Reply".

Input: `{ subject, from, body, userContext?: string }`
Output: `{ draft: string }` — a complete reply body

Prompt template:
```
You are a professional email assistant. Write a polite and helpful reply to the following email.
Keep it concise and professional. Return only the reply body text.

Original email:
From: {from}
Subject: {subject}
Body: {body}

{userContext ? "Context from user: " + userContext : ""}
```

Fallback: "" (empty draft)

### 3. Priority Scoring

Triggered when messages are loaded into the inbox.

Input: `{ subject, from, snippet }`
Output: `{ score: number, label: 'low' | 'medium' | 'high' | 'urgent' }`

Score ranges:
- 0–25: low (gray badge)
- 26–50: medium (blue badge)
- 51–75: high (orange badge)
- 76–100: urgent (red badge)

Fallback: `{ score: 50, label: 'medium' }`

## API Routes

- `POST /api/ai/summarize` — `{ emailId, body, subject, from }` → `{ summary }`
- `POST /api/ai/reply-draft` — `{ emailId, body, subject, from, userContext? }` → `{ draft }`
- `POST /api/ai/priority` — `{ emailId, subject, from, snippet }` → `{ score, label }`

## Rules

- AI never sends emails automatically.
- All AI calls are server-side.
- AI output must be trimmed and length-validated.
- Always provide fallbacks.
- Rate limit: 10 AI requests per minute per user.

## Acceptance Criteria

- [ ] Summary appears automatically on email open
- [ ] Reply draft is generated on button click and is editable
- [ ] Priority badge appears on inbox items
- [ ] AI never sends automatically
- [ ] Fallbacks work when AI provider is unavailable
- [ ] Unit tests for prompt builders pass
- [ ] Unit tests for output parsers pass