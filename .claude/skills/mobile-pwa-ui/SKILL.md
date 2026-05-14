---
name: mobile-pwa-ui
description: Use this skill when building mobile-first React components, implementing TailwindCSS responsive layouts, creating PWA manifest, handling loading/empty/error states, or polishing the mobile UI experience.
---

# Mobile PWA UI Skill

## When to Use

Use this skill when:
- Building new UI components
- Making components responsive (mobile + desktop)
- Creating PWA manifest and icons
- Adding loading, empty, or error states
- Improving mobile UX

## Step-by-Step Workflow

### Step 1 — Read the UI spec

```
Read docs/specs/02-ui-spec.md before building any component.
```

### Step 2 — Start with mobile layout

Design for 375px width first. Add `md:` and `lg:` breakpoints after.

### Step 3 — Component structure

```typescript
interface ComponentProps {
  // Always define props with TypeScript interfaces
  data: NormalizedEmailMessage[]
  isLoading: boolean
  error: string | null
}

export function InboxList({ data, isLoading, error }: ComponentProps) {
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data.length) return <EmptyState />
  return (/* main content */)
}
```

### Step 4 — TailwindCSS patterns for email UI

```
Inbox list:     flex flex-col divide-y divide-gray-100
Inbox item:     flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer
Email detail:   flex flex-col h-full overflow-y-auto p-4
Compose modal:  fixed inset-0 z-50 flex items-end md:items-center justify-center
AI panel:       border-l border-gray-100 p-4 hidden lg:block
Account badge:  flex items-center gap-2 text-sm font-medium
Priority badge: inline-flex px-2 py-0.5 rounded-full text-xs
```

### Step 5 — PWA manifest

Create `public/manifest.json`:

```json
{
  "name": "AI Mail",
  "short_name": "AI Mail",
  "description": "AI-first universal email client",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Step 6 — Add states

Every component must handle:
- `isLoading={true}`: show skeleton or spinner
- `error !== null`: show error message with retry button
- `data.length === 0`: show empty state message

### Step 7 — Test responsiveness

Check at 375px, 768px, and 1280px widths using browser DevTools.

## Implementation Rules

1. TailwindCSS only. No inline styles.
2. Mobile layout first. Desktop is secondary.
3. No email or AI logic inside components.
4. No secrets or environment variables in components.
5. TypeScript props interfaces required.
6. Always handle loading, empty, error states.

## Acceptance Criteria

- [ ] All components have TypeScript prop interfaces
- [ ] 375px mobile layout works
- [ ] 1280px desktop layout works
- [ ] Loading state is implemented
- [ ] Empty state is implemented
- [ ] Error state is implemented
- [ ] PWA manifest is valid JSON
- [ ] App is installable on mobile

## Example Prompts

```
Use the ui-ux agent and mobile-pwa-ui skill.
Read docs/specs/02-ui-spec.md first.
Build InboxList and InboxItem components in components/inbox/.
Use NormalizedEmailMessage from lib/email/types.ts as the item type.
Build mobile-first. Add loading, empty, and error states.
No email API calls inside components — use props.
```