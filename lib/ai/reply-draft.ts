import { callAI, AIConfig } from './client';

/**
 * Generates a contextual reply draft for an email.
 */
export async function generateReplyDraft(subject: string, body: string, context?: string, config?: AIConfig): Promise<string> {
  const prompt = `
Generate a professional and helpful reply draft for the following email.
Ensure the tone matches the context. If the email is formal, be formal. If it is personal, be warm.
Keep it concise and clear.

SUBJECT: ${subject}
EMAIL CONTENT:
${body.substring(0, 4000)}

USER CONTEXT/INSTRUCTION (Optional): ${context || 'None provided'}

DRAFT REPLY:
  `.trim();

  try {
    const response = await callAI([
      { role: 'system', content: 'You are an expert communicator who drafts perfect email replies. You output ONLY the draft text.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.5, maxTokens: 500 }, config);

    return response.trim() || 'Reply draft generation failed.';
  } catch (error) {
    console.error('[AI] Reply generation failed:', error);
    return 'Failed to generate intelligence reply draft.';
  }
}
