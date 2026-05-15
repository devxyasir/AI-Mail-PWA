import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';
import { createProvider } from '@/lib/email/providers/registry';
import { getAccountsByUser, db } from '@/lib/db/client';
import { decryptObject } from '@/lib/security/encrypt';
import type { EmailAccount } from '@/lib/email/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const body = await request.json();
    const { accountId, to, subject, body: content } = body;
    
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
      if (!accounts.length) return NextResponse.json({ error: 'No accounts' }, { status: 400 });
      account = accounts[0];
    }

    const decryptedAccount = { ...account, credentials: decryptObject(account.credentials as unknown as string) } as unknown as EmailAccount;
    const provider = createProvider(decryptedAccount);

    await provider.sendMessage({
      to: typeof to === 'string' ? [to] : to,
      subject,
      body: content
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Send email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
