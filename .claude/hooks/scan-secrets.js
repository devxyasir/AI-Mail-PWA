#!/usr/bin/env node
/**
 * scan-secrets.js
 * 
 * Claude Code PreToolUse hook for Bash tool.
 * Warns if a command appears to be writing secrets to source files
 * or echoing sensitive values.
 * 
 * This hook WARNS but does not block (exit 0).
 * Modify to exit(2) if you want hard blocking.
 */

const SECRET_PATTERNS = [
  /echo.*API_KEY\s*=\s*["\'][^"\']{8,}/i,
  /echo.*SECRET\s*=\s*["\'][^"\']{8,}/i,
  /echo.*PASSWORD\s*=\s*["\'][^"\']{8,}/i,
  /echo.*TOKEN\s*=\s*["\'][^"\']{16,}/i,
  /ANTHROPIC_AUTH_TOKEN\s*=\s*sk-[a-zA-Z0-9]{20,}/,
  /process\.env\.[A-Z_]{5,}\s*=\s*["\'][^"\']{8,}/,
]

let input = ''

process.stdin.on('data', (chunk) => {
  input += chunk.toString()
})

process.stdin.on('end', () => {
  try {
    const parsed = JSON.parse(input)
    const command = parsed.tool_input?.command || parsed.command || input

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(command)) {
        console.warn(`[HOOK] Warning: Command may contain a secret value.`)
        console.warn(`[HOOK] Review before proceeding: ${command.substring(0, 80)}...`)
        // Exit 0 = warn only. Change to exit(2) to block.
        process.exit(0)
      }
    }

    process.exit(0)
  } catch {
    process.exit(0)
  }
})