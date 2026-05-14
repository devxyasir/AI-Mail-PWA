# 02 — UI Spec

## Goal

Build a clean, mobile-first email client UI with distinct views for inbox, email detail,
compose, account switching, and AI features.

## Pages and Components

### Login Page (`/auth/signin`)
- Provider login buttons: Gmail, Microsoft, IMAP manual entry
- IMAP form: host, port, username, password
- Clean centered layout

### Inbox Page (`/inbox`)
- Full-height layout with sidebar (desktop) / bottom nav (mobile)
- Inbox list takes main content area
- Each inbox item shows: sender, subject, snippet, time, read/unread state, priority badge

### Email Detail Panel
- Opens inline (desktop: side panel) or full screen (mobile)
- Shows: from, to, subject, date, full body
- AI summary bar at top (auto-shown)
- AI reply draft button
- Actions: Reply, Forward, Archive, Delete, Labels

### Compose Modal
- Slides up from bottom (mobile) or centered modal (desktop)
- Fields: To, Subject, Body
- AI draft insertion button
- Send and Cancel buttons

### Account Switcher
- Sidebar item or top dropdown
- Shows all connected accounts with provider icon
- "All Accounts" option at top
- Add Account button

### AI Panel
- Summary: shown automatically when email opens (collapsible)
- Reply Draft: shown on button press, editable text area
- Priority Badge: color-coded pill on inbox items (low=gray, medium=blue, high=orange, urgent=red)

## Responsive Breakpoints

- Mobile: < 768px — single column, bottom navigation
- Tablet: 768px–1024px — sidebar collapses to icons
- Desktop: > 1024px — full sidebar + list + detail three-column

## Design Tokens

- Primary: #2563eb (blue)
- Danger: #dc2626 (red)
- Success: #16a34a (green)
- Background: #ffffff / #f9fafb
- Border: #e5e7eb
- Font: system-ui or Inter

## Acceptance Criteria

- [ ] Works on 375px mobile width
- [ ] Works on 1280px desktop
- [ ] Inbox list is visible and scrollable
- [ ] Email detail opens correctly
- [ ] Compose modal opens and submits
- [ ] Account switcher shows all accounts
- [ ] AI summary appears on email open
- [ ] Loading, empty, and error states are implemented