# Workflow — Claude Code CLI Build Process

## Overview

This project was built using Claude Code CLI with a specs-driven, multi-agent workflow.
Each implementation phase used a specific agent and free model from OpenRouter.

## Methodology

### Agent OS Methodology

The project follows the Agent OS approach:
- `CLAUDE.md` at project root defines always-active project rules.
- `.claude/agents/` holds 8 subagent definitions — specialized system prompts.
- `.claude/skills/` holds reusable task instructions loaded per workflow.
- `.claude/commands/` holds custom `/commands` that standardize workflows.
- `.claude/hooks/` holds safety and quality hooks.

### Specs-Driven Development

Before any code was written:
1. All 8 spec files were written in `docs/specs/`.
2. Each spec defines requirements, data models, API behavior, and acceptance criteria.
3. Implementation agents read the relevant spec before writing code.
4. Agents implement only what the spec describes.

### One-Agent-At-A-Time Rule

Only one Claude Code session ran at a time.
Each session used one agent with one model.
After each session: lint + test + build + commit.

## Build Phases

| Phase | Agent | Model | Output |
|-------|-------|-------|--------|
| 0 | — | — | Claude Code setup, OpenRouter connection |
| 1 | — | — | Next.js project creation |
| 2 | — | — | Folder structure, CLAUDE.md, agents, skills |
| 3 | Product Architect | ring-2.6-1t:free | 8 spec files |
| 4 | Documentation | ring-2.6-1t:free | architecture.md |
| 5 | Backend/API | qwen3-coder:free | Types, schema |
| 6 | UI/UX | qwen3-coder:free | UI skeleton |
| 7 | Email Integration | qwen3-coder:free | Adapter interface + structure |
| 8 | Email Integration | qwen3-coder:free | Gmail adapter |
| 9 | Email Integration | qwen3-coder:free | Microsoft adapter |
| 10 | Email Integration | qwen3-coder:free | IMAP adapter |
| 11 | Backend/API | qwen3-coder:free | Unified inbox service |
| 12 | Backend/API + UI/UX | qwen3-coder:free | Compose/reply/forward |
| 13 | Backend/API | qwen3-coder:free | Search, labels, archive, delete |
| 14 | AI Inbox | deepseek-r1:free | AI features (summary, draft, priority) |
| 15 | Security | ring-2.6-1t:free | Security review + fixes |
| 16 | Testing | qwen3-coder:free | Full test coverage |
| 17 | UI/UX | qwen3-coder:free | PWA polish |
| 18 | — | — | Vercel deployment |
| 19 | Documentation | ring-2.6-1t:free | Final deliverables |

## Daily Workflow Pattern

```
1. Start Claude Code: claude --model <model>
2. Read spec: "Read docs/specs/XX.md"
3. Implement: one feature, one agent
4. Verify: npm run test:all
5. Commit: git add . && git commit -m "..."
6. Move to next phase