import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';
import { generateEmailContent } from '@/lib/ai/write';

export async function POST(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const { subject, prompt, context, history } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    const result = await generateEmailContent(subject, prompt, context, history);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] AI Write error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
