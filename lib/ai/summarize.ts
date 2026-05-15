import { callAI, AIConfig } from './client';

/**
 * Generates a concise, high-value summary of an email message.
 */
export async function summarizeEmail(subject: string, body: string, config?: AIConfig): Promise<string> {
  const prompt = `
Summarize the following email thread with high precision.
Focus ONLY on actionable items, key decisions, and critical context.
Keep it under 3 bullet points if possible.
DO NOT use conversational filler (e.g., "This email is about...").
DO NOT use markdown formatting other than bullet points.

SUBJECT: ${subject}
BODY:
${body.substring(0, 5000)} // Truncate to avoid token limits

SUMMARY:
  `.trim();

  try {
    const response = await callAI([
      { role: 'system', content: 'You are an elite executive assistant specializing in email intelligence. You provide concise, actionable summaries.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, maxTokens: 250 }, config);

    return response.trim() || 'Summary unavailable.';
  } catch (error) {
    console.error('[AI] Summarization failed:', error);
    return 'Failed to generate intelligence summary.';
  }
}
