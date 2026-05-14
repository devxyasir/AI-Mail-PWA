#!/usr/bin/env node
/**
 * block-dangerous-commands.js
 * 
 * Claude Code PreToolUse hook for Bash tool.
 * Reads the command from stdin as JSON and blocks dangerous patterns.
 * 
 * Exit codes:
 *   0 = allow command
 *   2 = block command (Claude Code respects exit code 2 as a block signal)
 */

const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\//,          // rm -rf / (root deletion)
  /rm\s+-rf\s+~\//,         // rm -rf ~/
  /rm\s+-rf\s+\.\s*$/,      // rm -rf . (current directory)
  /format\s+[a-zA-Z]:/,     // Windows format drive
  /del\s+\/[sS]\s+\/[qQ]/,  // Windows del /s /q
  /shutdown/,                // shutdown command
  /:\(\)\s*\{.*\}/,         // fork bomb
  /curl.*\|\s*bash/,        // curl piped to bash
  /wget.*\|\s*sh/,          // wget piped to sh
  /sudo\s+rm/,              // sudo rm
  /DROP\s+DATABASE/i,       // SQL DROP DATABASE
  /DROP\s+TABLE/i,          // SQL DROP TABLE (flag for review)
]

let input = ''

process.stdin.on('data', (chunk) => {
  input += chunk.toString()
})

process.stdin.on('end', () => {
  try {
    const parsed = JSON.parse(input)
    const command = parsed.tool_input?.command || parsed.command || input

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        console.error(`[HOOK] Blocked dangerous command pattern: ${pattern}`)
        console.error(`[HOOK] Command was: ${command.substring(0, 100)}`)
        process.exit(2)
      }
    }

    // Command is safe
    process.exit(0)
  } catch {
    // If we can't parse input, allow (don't block legitimate commands)
    process.exit(0)
  }
})