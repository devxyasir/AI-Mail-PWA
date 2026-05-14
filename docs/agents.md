# Agents, Skills, Hooks, and Commands

## Agents

| Agent | File | Purpose |
|-------|------|---------|
| Product Architect | `.claude/agents/product-architect.md` | Specs, scope, acceptance criteria |
| UI/UX | `.claude/agents/ui-ux.md` | Mobile-first UI components |
| Email Integration | `.claude/agents/email-integration.md` | Gmail, Microsoft, IMAP adapters |
| Backend/API | `.claude/agents/backend-api.md` | API routes, database, unified inbox |
| AI Inbox | `.claude/agents/ai-inbox.md` | AI summary, reply draft, priority |
| Security | `.claude/agents/security.md` | Security review, credential safety |
| Testing | `.claude/agents/testing.md` | Unit tests, Playwright, mocks |
| Documentation | `.claude/agents/documentation.md` | All docs and deliverables |

## Skills

| Skill | Folder | Purpose |
|-------|--------|---------|
| Email Provider Integration | `.claude/skills/email-provider-integration/` | Provider adapter pattern |
| AI Email Intelligence | `.claude/skills/ai-email-intelligence/` | AI prompts and parsing |
| Mobile PWA UI | `.claude/skills/mobile-pwa-ui/` | Mobile-first Tailwind UI |
| Security Review | `.claude/skills/security-review/` | Security audit workflow |
| Test Generation | `.claude/skills/test-generation/` | Vitest + Playwright tests |
| Deployment | `.claude/skills/deployment/` | Vercel deploy workflow |

## Custom Commands

| Command | File | Purpose |
|---------|------|---------|
| /spec-feature | `.claude/commands/spec-feature.md` | Write spec for a feature |
| /implement-feature | `.claude/commands/implement-feature.md` | Implement from spec |
| /review-security | `.claude/commands/review-security.md` | Security audit |
| /generate-tests | `.claude/commands/generate-tests.md` | Write tests |
| /fix-build | `.claude/commands/fix-build.md` | Fix lint/test/build errors |
| /write-deliverables | `.claude/commands/write-deliverables.md` | Final docs |

## Hooks

| Hook | File | Trigger | Purpose |
|------|------|---------|---------|
| Block Dangerous Commands | `.claude/hooks/block-dangerous-commands.js` | PreToolUse (Bash) | Block rm -rf /, sudo rm, etc. |
| Scan Secrets | `.claude/hooks/scan-secrets.js` | PreToolUse (Bash) | Warn on secret echo patterns |
| Post-Edit Quality Check | `.claude/hooks/post-edit-quality-check.js` | PostToolUse (Edit/Write) | Warn on token logging, TODO markers |