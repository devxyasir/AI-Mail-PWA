import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAccountById } from '@/lib/db/client';
import { decryptObject } from '@/lib/security/encrypt';
import { createProvider } from '@/lib/email/providers/registry';
import { getSessionUser } from '@/lib/security/session';
import type { EmailAccount } from '@/lib/email/types';

const UpdateLabelsSchema = z.object({
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
});

/**
 * POST /api/email/[id]/labels
 *
 * Updates labels for a specific message using its composite ID.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validated = UpdateLabelsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid label data', details: validated.error.format() },
        { status: 400 }
      );
    }

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

    // 3. Update via provider
    const provider = createProvider(decryptedAccount);
    
    if (provider.updateMessageLabels) {
      await provider.updateMessageLabels(
        providerMessageId, 
        validated.data.add, 
        validated.data.remove
      );
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Label updates not supported by this provider' },
        { status: 501 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API] Update labels error (${id}):`, error);
    return NextResponse.json(
      { error: 'Failed to update labels', details: message },
      { status: 500 }
    );
  }
}
