import { NextRequest, NextResponse } from 'next/server';
import { getAccountsByUser } from '@/lib/db/client';
import { getSessionUser } from '@/lib/security/session';
import { decryptObject } from '@/lib/security/encrypt';
import { createProvider } from '@/lib/email/providers/registry';
import type { EmailAccount } from '@/lib/email/types';

/**
 * GET /api/email/labels
 * 
 * Fetches and merges all labels from all connected accounts.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse) return errorResponse;

    // 1. Get all accounts
    const accounts = await getAccountsByUser(userId);
    if (accounts.length === 0) {
      return NextResponse.json({ labels: [] });
    }

    // 2. Fetch labels from each provider
    const labelPromises = accounts.map(async (acc) => {
      try {
        const decryptedAccount = {
          ...acc,
          credentials: decryptObject(acc.credentials as unknown as string),
        } as unknown as EmailAccount;

        const provider = createProvider(decryptedAccount);
        return await provider.listLabels();
      } catch (error) {
        console.error(`[API] Labels fetch error for ${acc.id}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(labelPromises);
    
    // 3. Merge and deduplicate (by name)
    const allLabelsMap = new Map<string, { id: string; name: string; color?: string; type: string }>();
    
    // Add system labels first
    allLabelsMap.set('INBOX', { id: 'INBOX', name: 'Inbox', color: '#2563eb', type: 'system' });
    allLabelsMap.set('SENT', { id: 'SENT', name: 'Sent', color: '#16a34a', type: 'system' });
    allLabelsMap.set('TRASH', { id: 'TRASH', name: 'Trash', color: '#dc2626', type: 'system' });

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        result.value.forEach((label) => {
          // If label already exists (e.g. "Work" on two accounts), we just keep one for the sidebar
          if (!allLabelsMap.has(label.name.toUpperCase())) {
            allLabelsMap.set(label.name.toUpperCase(), {
              id: label.id,
              name: label.name,
              color: label.color,
              type: label.type
            });
          }
        });
      }
    });

    return NextResponse.json({ labels: Array.from(allLabelsMap.values()) });
  } catch (error) {
    console.error('[API] Labels fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
