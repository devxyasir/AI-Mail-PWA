# Architecture — AI-First Universal Email Client PWA

## Overview

This is a Next.js 14 App Router application deployed on Vercel. It connects to Gmail,
Microsoft Graph, and IMAP email providers through a normalized adapter interface. AI features
are powered by an OpenRouter-compatible API.

## Frontend Architecture

```
app/
├── (app)/inbox/page.tsx     — Inbox page (server component)
├── (app)/compose/page.tsx   — Compose page
├── auth/signin/page.tsx     — Sign in page
└── api/                     — API Routes (server-side only)

components/
├── inbox/                   — Inbox list and email detail
├── compose/                 — Compose modal
├── ai/                      — AI summary, reply draft, priority badge
└── layout/                  — Sidebar, account switcher, mobile nav
```

## Backend Architecture

```
API Routes (app/api/)
├── /api/auth/[...nextauth]  — NextAuth authentication
├── /api/email/list          — Unified inbox: fetch + merge + sort
├── /api/email/[id]          — Get single email (with body)
├── /api/email/send          — Send / reply / forward
├── /api/email/search        — Search across providers
├── /api/accounts            — Manage connected accounts
├── /api/ai/summarize        — AI email summary
├── /api/ai/reply-draft      — AI reply draft
└── /api/ai/priority         — AI priority scoring

Library (lib/)
├── email/types.ts           — NormalizedEmailMessage, EmailDraft, etc.
├── email/provider-adapter.ts — EmailProviderAdapter interface
├── email/providers/         — Gmail, Microsoft, IMAP adapters
├── ai/                      — Prompt builders + response parsers
├── security/encrypt.ts      — AES-256-GCM credential encryption
└── db/                      — Supabase client + schema helpers
```

## Provider Adapter Pattern

All three providers implement the same interface:

```
EmailProviderAdapter
├── GmailAdapter     → normalizes Gmail API v1 responses
├── MicrosoftAdapter → normalizes Microsoft Graph v1.0 responses
└── ImapAdapter      → normalizes IMAP/imapflow responses
```

Each adapter receives credentials in its constructor (never from client).
Each adapter returns `NormalizedEmailMessage` — no raw provider types escape.

## AI Pipeline

```
User opens email
   → Client calls POST /api/ai/summarize
   → Route validates input with Zod
   → Route calls buildSummaryPrompt(email)
   → Route calls OpenRouter API (server-side)
   → Route calls parseSummaryResponse(aiResponse)
   → Route returns { summary } to client
   → Client displays summary in AISummaryPanel
```

## Database Schema (Supabase PostgreSQL)

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ
)

email_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider TEXT,             -- 'gmail' | 'microsoft' | 'imap'
  email_address TEXT,
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  imap_host TEXT,
  imap_port INTEGER,
  encrypted_password TEXT,
  created_at TIMESTAMPTZ
)

email_cache (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES email_accounts(id),
  provider_message_id TEXT,
  normalized_data JSONB,     -- NormalizedEmailMessage
  cached_at TIMESTAMPTZ
)
```

## Security

- OAuth tokens and IMAP passwords encrypted with AES-256-GCM.
- All secrets in environment variables.
- NextAuth sessions via httpOnly, secure cookies.
- All API inputs validated with Zod.
- AI API called server-side only.

## Deployment

- Vercel (automatic deploys from main branch)
- Supabase (database + auth)
- OpenRouter (AI API)