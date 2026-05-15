/**
 * Validation helpers for securing API inputs.
 */

export function sanitizeEmailInput(input: string): string {
  // Basic XSS mitigation for plain text bodies
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function validateEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
