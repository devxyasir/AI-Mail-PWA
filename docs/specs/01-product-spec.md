# 01 — Product Spec

## Goal

Build an AI-first universal email client as a mobile-ready PWA that supports Gmail, Office 365,
and IMAP providers with AI-powered inbox intelligence.

## User Stories

- As a user, I can connect my Gmail account and see my inbox.
- As a user, I can connect my Office 365 account and see my inbox.
- As a user, I can connect an IMAP account (Yahoo, AOL, custom) and see my inbox.
- As a user, I see all emails from all accounts in one unified inbox.
- As a user, I can switch between accounts or view all accounts together.
- As a user, I can read, compose, reply to, and forward emails.
- As a user, I can search my emails.
- As a user, I can apply labels to emails.
- As a user, I can archive or delete emails.
- As a user, I see an AI-generated summary when I open an email.
- As a user, I can request an AI-generated reply draft.
- As a user, I see AI priority scores on emails in my inbox.
- As a user, I can install the app on my phone as a PWA.

## Requirements

### Must Have (MVP)

- Gmail OAuth integration
- Microsoft Graph OAuth integration
- IMAP integration with username/password
- Unified inbox view
- Account switcher
- Compose new email
- Reply to email
- Forward email
- Search emails
- Apply / remove labels
- Archive email
- Delete email
- AI email summary (auto-shown on open)
- AI reply draft (on-demand)
- AI priority scoring (shown in inbox list)
- PWA (installable, offline-ready)
- Automated tests
- Vercel deployment

### Should Have

- Read/unread state tracking
- Thread view (group replies)
- Keyboard shortcuts

### Could Have (post-MVP)

- Push notifications via PWA
- Dark mode
- Email templates

## Non-Goals

- Contacts / address book
- Calendar integration
- Tasks / to-do lists
- Notes
- Chat / messaging
- File storage / cloud drive
- SMS or phone integration

## Data Model

See `docs/specs/03-email-provider-spec.md` for NormalizedEmailMessage.

## Acceptance Criteria

- [ ] Three provider logins work
- [ ] Unified inbox shows merged messages
- [ ] Compose / reply / forward works
- [ ] Search returns results
- [ ] Archive and delete work
- [ ] AI summary appears on email open
- [ ] AI reply draft can be generated
- [ ] Priority score shown in inbox
- [ ] App installs as PWA
- [ ] All tests pass
- [ ] Live Vercel URL exists