import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';

export async function GET(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    // Search logic will be implemented here, potentially bridging DB cache and provider
    return NextResponse.json({ messages: [] });
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
