#!/usr/bin/env node
/**
 * post-edit-quality-check.js
 * 
 * Claude Code PostToolUse hook for Edit/Write/MultiEdit tools.
 * Runs a lightweight quality check after file edits.
 * 
 * Checks:
 * - Warns if edited file contains TODO markers left by AI
 * - Warns if file contains console.log with potential secrets
 * - Does NOT run npm run lint (too slow for every edit)
 * 
 * To enable lint on every edit, uncomment the lint section below.
 */

const fs = require('fs')
const path = require('path')

const QUALITY_PATTERNS = [
    {
        pattern: /console\.log\(.*token.*\)/i,
        message: 'Warning: console.log may be logging a token value',
    },
    {
        pattern: /console\.log\(.*password.*\)/i,
        message: 'Warning: console.log may be logging a password',
    },
    {
        pattern: /console\.log\(.*secret.*\)/i,
        message: 'Warning: console.log may be logging a secret',
    },
    {
        pattern: /\/\/\s*TODO:\s*(implement|add|fix)/i,
        message: 'Note: File contains TODO comment — remember to complete this',
    },
    {
        pattern: /as any(?!\s*\/\/)/,
        message: 'Note: File uses `as any` cast — verify this is intentional',
    },
]

let input = ''

process.stdin.on('data', (chunk) => {
    input += chunk.toString()
})

process.stdin.on('end', () => {
    try {
        const parsed = JSON.parse(input)
        const filePath = parsed.tool_input?.path || parsed.path

        if (!filePath || !fs.existsSync(filePath)) {
            process.exit(0)
        }

        // Only check TypeScript/JavaScript files
        const ext = path.extname(filePath)
        if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            process.exit(0)
        }

        const content = fs.readFileSync(filePath, 'utf8')
        let hasWarnings = false

        for (const check of QUALITY_PATTERNS) {
            if (check.pattern.test(content)) {
                console.warn(`[HOOK] ${check.message}`)
                console.warn(`[HOOK] File: ${filePath}`)
                hasWarnings = true
            }
        }

        if (hasWarnings) {
            console.warn('[HOOK] Review the warnings above before committing.')
        }

        // Always exit 0 — these are warnings, not blockers
        process.exit(0)
    } catch {
        process.exit(0)
    }
})