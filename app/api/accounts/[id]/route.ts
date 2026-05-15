import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';
import { deleteAccount, getAccountById } from '@/lib/db/client';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const { id } = await params;

    const account = await getAccountById(id);
    if (!account || account.user_id !== userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const success = await deleteAccount(id);
    if (!success) {
      throw new Error('Failed to delete account');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
