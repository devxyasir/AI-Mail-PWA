import { NextRequest, NextResponse } from 'next/server';
import { getAccountById } from '@/lib/db/client';
import { decryptObject } from '@/lib/security/encrypt';
import { createProvider } from '@/lib/email/providers/registry';
import { getSessionUser } from '@/lib/security/session';
import type { EmailAccount } from '@/lib/email/types';

/**
 * DELETE /api/email/[id]
 *
 * Deletes a message using its composite ID.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    // 1. Decode composite ID
    let decodedId: string;
    try {
      decodedId = Buffer.from(id, 'base64url').toString();
    } catch {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const [accountId, providerMessageId] = decodedId.split(':');
    if (!accountId || !providerMessageId) {
      return NextResponse.json({ error: 'Malformed message ID' }, { status: 400 });
    }

    // 2. Fetch and decrypt account
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse) return errorResponse;

    const account = await getAccountById(accountId);
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

    // 3. Delete via provider
    const provider = createProvider(decryptedAccount);
    await provider.deleteMessage(providerMessageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API] Delete error (${id}):`, error);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ProviderAuthError') {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete message', details: message },
      { status: 500 }
    );
  }
}
