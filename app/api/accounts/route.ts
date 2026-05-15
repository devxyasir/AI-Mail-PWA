import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';
import { getAccountsByUser } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const accounts = await getAccountsByUser(userId);
    
    // Sanitize credentials before sending to client
    const sanitizedAccounts = accounts.map(acc => ({
      id: acc.id,
      email: acc.email,
      provider: acc.provider,
      displayName: acc.display_name,
      avatarUrl: acc.avatar_url,
      isCurrent: true // Logic to determine current can be added
    }));

    return NextResponse.json({ accounts: sanitizedAccounts });
  } catch (error) {
    console.error('[API] Fetch accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
