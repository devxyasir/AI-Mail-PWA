import { db } from '@/lib/db/client';
import { NormalizedEmailMessage } from './types';

/**
 * Triggers background indexing and priority scoring for fresh messages.
 * Decoupled from the main sync loop.
 */
export async function triggerBackgroundIndexing(accountId: string, freshMessages: NormalizedEmailMessage[]) {
  try {
    // This calls the same logic used in the list route to maintain consistency
    // In a real app, this would be a background queue (e.g. BullMQ, Inngest)
    // For now, we simulate with a non-awaited async call
    
    const { triggerEmailIndexing } = await import('@/app/api/email/list/route_utils');
    triggerEmailIndexing(accountId, freshMessages);
  } catch (err) {
    console.error('[Sync-Utils] Indexing trigger failed:', err);
  }
}
