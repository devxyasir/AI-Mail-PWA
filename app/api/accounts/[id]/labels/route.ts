import { NextRequest, NextResponse } from 'next/server';
import { getAccountById } from '@/lib/db/client';
import { decryptObject } from '@/lib/security/encrypt';
import { createProvider } from '@/lib/email/providers/registry';
import { getSessionUser } from '@/lib/security/session';
import type { EmailAccount } from '@/lib/email/types';

/**
 * GET /api/accounts/[id]/labels
 *
 * Lists all available labels/folders for a specific account.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 1. Fetch and decrypt account
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse) return errorResponse;

    const account = await getAccountById(id);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Ownership check
    if (account.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized account access' }, { status: 403 });
    }

    const decryptedAccount = {
      ...account,
      credentials: decryptObject(account.credentials as unknown as string),
    } as unknown as EmailAccount;

    // 2. Fetch labels via provider
    const provider = createProvider(decryptedAccount);
    const labels = await provider.listLabels();

    return NextResponse.json(labels);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API] List labels error for account ${id}:`, error);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ProviderAuthError') {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch labels', details: message },
      { status: 500 }
    );
  }
}
