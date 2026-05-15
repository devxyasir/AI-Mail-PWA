import { callAI } from './client';

/**
 * Generates an email body based on a user prompt, subject, and optional context.
 */
export async function generateEmailContent(
  subject: string, 
  prompt: string, 
  context?: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ subject: string; body: string }> {
  const fullPrompt = history.length === 0 ? `
You are an expert professional assistant. 
Your task is to write a high-quality email based on the following parameters:

CURRENT SUBJECT: ${subject || 'None provided'}
USER REQUEST/INTENT: ${prompt}
${context ? `ADDITIONAL CONTEXT/CURRENT BODY: ${context}` : ''}

INSTRUCTIONS:
1. Write a professional, clear, and concise email body.
2. Generate or improve the SUBJECT line. If a subject exists, refine it. If not, create a compelling one.
3. Return the result in a valid JSON format with "subject" and "body" keys.

STRICT INSTRUCTION: RETURN ONLY THE JSON OBJECT. NO PREAMBLE. NO POSTAMBLE.
`.trim() : `
The user wants to modify the previous email draft.

PREVIOUS CONVERSATION:
${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

LATEST REQUEST: ${prompt}
CURRENT BODY: ${context}

INSTRUCTIONS:
1. Modify the email according to the latest request.
2. Ensure the tone is consistent.
3. If the subject needs changing based on the edit, update it.
4. Return the result in a valid JSON format with "subject" and "body" keys.

STRICT INSTRUCTION: RETURN ONLY THE JSON OBJECT. NO PREAMBLE. NO POSTAMBLE.
`.trim();

  try {
    const messages: any[] = [
      { role: 'system', content: 'You are a professional email composer. You output JSON with "subject" and "body" keys.' }
    ];

    // If we have history, we could add it here, but the prompt above already includes it for simplicity
    // and better control over the "edit" flow.
    messages.push({ role: 'user', content: fullPrompt });

    const rawContent = await callAI(messages, { temperature: 0.7 });

    const cleanJson = rawContent.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      subject: parsed.subject || subject || 'Important Update',
      body: parsed.body || ''
    };
  } catch (error) {
    console.error('[AI] Write generation failed:', error);
    throw error;
  }
}
