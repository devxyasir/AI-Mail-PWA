import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callAI } from '@/lib/ai/client';
import { getSessionUser } from '@/lib/security/session';

const AssistSchema = z.object({
  subject: z.string().optional(),
  body: z.string().optional(),
  prompt: z.string().optional(),
});

/**
 * POST /api/ai/assist
 * 
 * Uses AI to help write or improve an email draft, including subject and body.
 */
export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await getSessionUser();
    if (errorResponse) return errorResponse;

    const reqBody = await request.json();
    const validated = AssistSchema.safeParse(reqBody);
    
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { subject, body, prompt } = validated.data;

    const systemPrompt = `You are an expert email assistant. 
Help the user write a professional email. 
If the user provides instructions, generate a suitable subject line and a full email body.
If the user provides a partial draft, improve it.

Return ONLY a JSON object in this format:
{
  "subject": "The generated or improved subject line",
  "body": "The generated or improved email body"
}
Do not include any other text in your response.`;

    const userPrompt = `
INSTRUCTIONS: ${prompt || 'Help me write this email.'}
CURRENT SUBJECT: ${subject || ''}
CURRENT BODY: ${body || ''}
    `.trim();

    const responseText = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { 
      temperature: 0.7, 
      maxTokens: 1200,
      // @ts-ignore
      response_format: { type: 'json_object' } // Some providers support this
    });

    try {
      // Clean up response if it has markdown wrappers
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const result = JSON.parse(cleaned);
      return NextResponse.json({ 
        subject: result.subject || subject, 
        body: result.body || body 
      });
    } catch (e) {
      // Fallback if AI didn't return valid JSON
      return NextResponse.json({ 
        subject: subject,
        body: responseText 
      });
    }
  } catch (error) {
    console.error('[API] Assist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
