import { NextRequest, NextResponse } from 'next/server';
import { db, getAccountsByUser } from '@/lib/db/client';
import { getSessionUser } from '@/lib/security/session';
import { createProvider } from '@/lib/email/providers/registry';
import { decryptObject } from '@/lib/security/encrypt';
import type { EmailAccount, NormalizedEmailMessage } from '@/lib/email/types';

/**
 * GET /api/email/list
 * 
 * Aggregates emails across all user accounts with AI priority injection.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse || !userId) return errorResponse;

    const searchParams = request.nextUrl.searchParams;
    const labelId = searchParams.get('labelId') || 'INBOX';
    const pageToken = searchParams.get('pageToken');
    const limit = parseInt(searchParams.get('limit') || '20');
    const priorityFilter = searchParams.get('priority');
    const searchQuery = searchParams.get('q');

    const accounts = await getAccountsByUser(userId);
    if (!accounts.length) {
      return NextResponse.json({ messages: [], nextPageToken: null });
    }

    // 1. Decrypt credentials for all accounts
    const decryptedAccounts = accounts.map(acc => ({
      ...acc,
      credentials: decryptObject(acc.credentials as unknown as string)
    })) as unknown as EmailAccount[];

    // 2. Fetch from providers
    const providerMessages = await Promise.all(decryptedAccounts.map(async (acc) => {
      const provider = createProvider(acc);
      try {
        const msgs = await provider.listMessages({ 
          labelId, 
          query: searchQuery || undefined,
          maxResults: limit,
          pageToken: pageToken || undefined
        });
        // Attach account ID for unified tracking
        return msgs.map(m => ({ ...m, accountId: acc.id }));
      } catch (err) {
        console.error(`[API] Failed to fetch for ${acc.email}:`, err);
        return [];
      }
    }));

    const allMessages = providerMessages.flat();

    // 3. Inject AI Priority Labels from DB
    const messageIds = allMessages.map(m => m.providerMessageId);
    const { data: aiData } = await db()
      .from('email_ai_data')
      .select('provider_message_id, priority_label, priority_score')
      .in('provider_message_id', messageIds);

    const aiMap = new Map((aiData as any[])?.map(d => [d.provider_message_id, d]) || []);

    const enrichedMessages = allMessages.map(m => {
      const ai = aiMap.get(m.providerMessageId);
      const priorityLabel = ai?.priority_label || 'low';
      
      return {
        ...m,
        priority: priorityLabel,
        aiScore: ai?.priority_score,
        // Ensure the priority label is in the labels array for UI
        labels: [...(m.labels || []), priorityLabel.toUpperCase()]
      } as NormalizedEmailMessage;
    });

    // 4. Apply Priority Filtering if requested
    let finalMessages = enrichedMessages;
    if (priorityFilter) {
      if (priorityFilter === 'all') {
        // "All Priority" shows everything EXCEPT the 'low' bucket
        finalMessages = enrichedMessages.filter(m => m.priority && m.priority !== 'low');
      } else {
        finalMessages = enrichedMessages.filter(m => m.priority === priorityFilter);
      }
    }

    // 5. Trigger background indexing for anything new
    if (allMessages.length > 0) {
      const { triggerEmailIndexing } = await import('./route_utils');
      
      // Group by account to ensure correct indexing
      const accountGroups = allMessages.reduce((acc, m) => {
        if (!m.accountId) return acc;
        if (!acc[m.accountId]) acc[m.accountId] = [];
        acc[m.accountId].push(m);
        return acc;
      }, {} as Record<string, NormalizedEmailMessage[]>);

      for (const [accId, msgs] of Object.entries(accountGroups)) {
        triggerEmailIndexing(accId, msgs);
      }
    }

    return NextResponse.json({ 
      messages: finalMessages,
      nextPageToken: null 
    });

  } catch (error) {
    console.error('[API] Email list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
