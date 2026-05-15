import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';
import { summarizeEmail } from '@/lib/ai/summarize';
import { db, upsertAiData } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const { accountId, messageId } = await request.json();

    const { data } = await db()
      .from('email_cache')
      .select('normalized_data')
      .eq('provider_message_id', messageId)
      .single();

    if (!data) return NextResponse.json({ error: 'Message not found in cache' }, { status: 404 });

    const msg = (data as any).normalized_data;
    
    const summary = await summarizeEmail(msg.subject, msg.body || msg.snippet);

    await upsertAiData(accountId, messageId, { summary });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[API] AI Summarize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
