import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/security/session';
import { getDraftsByUser, upsertDraft, deleteDraft } from '@/lib/db/client';

/**
 * GET /api/email/drafts - Fetch all drafts for the user
 * POST /api/email/drafts - Create/Update a draft
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const drafts = await getDraftsByUser(userId);
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('[API] Drafts fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const body = await request.json();
    const draft = await upsertDraft({
      ...body,
      user_id: userId
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('[API] Draft save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/email/drafts?id=[draftId]
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Draft ID required' }, { status: 400 });
    }

    await deleteDraft(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Draft delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
