import { NextRequest, NextResponse } from 'next/server';
import { initBackgroundSync } from '@/lib/email/sync-service';
import { getSessionUser } from '@/lib/security/session';

/**
 * POST /api/email/sync/start
 *
 * Initiates the background sync service if it hasn't started yet.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    initBackgroundSync();
    return NextResponse.json({ success: true, status: 'Background sync listener active' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start sync' }, { status: 500 });
  }
}
