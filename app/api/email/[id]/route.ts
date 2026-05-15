import { NextRequest, NextResponse } from 'next/server';
import { db, getAccountsByUser } from '@/lib/db/client';
import { getSessionUser } from '@/lib/security/session';
import { createProvider } from '@/lib/email/providers/registry';
import { decryptObject } from '@/lib/security/encrypt';
import type { EmailAccount } from '@/lib/email/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const { id: messageId } = await params;
    const accountId = request.nextUrl.searchParams.get('accountId');
    
    let account;
    if (accountId) {
      const { data: acc, error: accError } = await db()
        .from('email_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', userId)
        .single();
      
      if (accError || !acc) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      account = acc;
    } else {
      const accounts = await getAccountsByUser(userId);
      if (!accounts.length) return NextResponse.json({ error: 'No accounts' }, { status: 404 });
      account = accounts[0];
    }

    const decryptedAccount = { ...account, credentials: decryptObject(account.credentials as unknown as string) } as unknown as EmailAccount;
    const provider = createProvider(decryptedAccount);

    const message = await provider.getMessage(messageId);
    
    // Inject AI Data from DB
    const { data: aiData } = await db()
      .from('email_ai_data')
      .select('*')
      .eq('account_id', account.id)
      .eq('provider_message_id', messageId)
      .single();

    const aiDataValue = (aiData || {}) as any;
    return NextResponse.json({ 
      message: {
        ...message,
        priority: aiDataValue.priority_label || 'low',
        aiScore: aiDataValue.priority_score,
        aiSummary: aiDataValue.summary
      }
    });

  } catch (error) {
    console.error('[API] Message detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
