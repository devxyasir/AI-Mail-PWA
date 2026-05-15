import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';
import { generateReplyDraft } from '@/lib/ai/reply-draft';
import { db } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const { messageId, context } = await request.json();
    
    // Fetch original message content from DB cache for context
    const { data } = await db()
      .from('email_cache')
      .select('normalized_data')
      .eq('provider_message_id', messageId)
      .single();

    if (!data) return NextResponse.json({ error: 'Message not found in cache' }, { status: 404 });

    const msg = (data as any).normalized_data;
    
    const draft = await generateReplyDraft(msg.subject, msg.body || msg.snippet, context);

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('[API] AI Reply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
