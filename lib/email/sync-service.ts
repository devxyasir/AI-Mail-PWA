import { db, getAccountsByUser } from '@/lib/db/client';
import { decryptObject } from '@/lib/security/encrypt';
import { createProvider } from '@/lib/email/providers/registry';
import type { EmailAccount, NormalizedEmailMessage } from '@/lib/email/types';

/**
 * Service to handle background email synchronization and AI categorization.
 */
export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private backfillInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance() {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  /**
   * Starts the background sync and prioritization loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log(`[Sync] Background sync & categorization service activated.`);
    
    // 1. Regular Sync Loop (New Emails) - Every 2 minutes
    this.syncAllAccounts();
    this.interval = setInterval(() => {
      this.syncAllAccounts();
    }, 2 * 60 * 1000);

    // 2. Continuous Backfill Loop (Old Emails) - Every 30 seconds
    // This processes existing emails that haven't been categorized yet
    this.runContinuousPrioritization();
    this.backfillInterval = setInterval(() => {
      this.runContinuousPrioritization();
    }, 30 * 1000);
  }

  /**
   * Stops all background workers.
   */
  stop() {
    if (this.interval) clearInterval(this.interval);
    if (this.backfillInterval) clearInterval(this.backfillInterval);
    this.interval = null;
    this.backfillInterval = null;
    this.isRunning = false;
    console.log('[Sync] Background workers deactivated.');
  }

  /**
   * Synchronizes all accounts to fetch NEW messages.
   */
  async syncAllAccounts() {
    try {
      const { data: accounts } = await db().from('email_accounts').select('*');
      if (!accounts) return;

      for (const acc of (accounts as any[])) {
        await this.syncAccount(acc.id);
      }
    } catch (err) {
      console.error('[Sync] Sync loop error:', err);
    }
  }

  /**
   * Continuous background worker to process OLD/UNCATEGORIZED messages.
   */
  async runContinuousPrioritization() {
    try {
      // 1. Get IDs of already prioritized messages
      const { data: prioritizedIds } = await (db() as any)
        .from('email_ai_data')
        .select('provider_message_id');
      
      const excludeIds = (prioritizedIds as any[])?.map(p => p.provider_message_id) || [];

      // 2. Find messages in cache that are NOT in prioritized list
      let query = db()
        .from('email_cache')
        .select('account_id, provider_message_id, normalized_data')
        .order('fetched_at', { ascending: false });

      if (excludeIds.length > 0) {
        // If there are many IDs, we might hit a limit in the 'not in' clause
        // So we just take a chunk of the cache and filter in JS if needed
        // But for now, let's try the direct 'not in' if it's not too huge
        if (excludeIds.length < 1000) {
          query = query.not('provider_message_id', 'in', `(${excludeIds.join(',')})`);
        }
      }

      const { data: unPrioritized, error } = await query.limit(30);

      if (error || !unPrioritized || unPrioritized.length === 0) return;

      console.log(`[AI] Background worker: Categorizing ${unPrioritized.length} old messages...`);

      const { triggerEmailIndexing } = await import('@/app/api/email/list/route_utils');
      
      // Group by account to be efficient
      const accountGroups = (unPrioritized as any[]).reduce((acc: any, curr: any) => {
        if (!acc[curr.account_id]) acc[curr.account_id] = [];
        acc[curr.account_id].push(curr.normalized_data as unknown as NormalizedEmailMessage);
        return acc;
      }, {} as Record<string, NormalizedEmailMessage[]>);

      for (const [accountId, messages] of Object.entries(accountGroups)) {
        await triggerEmailIndexing(accountId, messages as any);
      }
    } catch (err) {
      console.error('[AI] Continuous prioritization error:', err);
    }
  }

  async syncAccount(accountId: string) {
    try {
      const { data: acc, error: fetchError } = await db().from('email_accounts').select('*').eq('id', accountId).single();
      if (fetchError || !acc) {
        console.error(`[Sync] Account ${accountId} not found in DB:`, fetchError);
        return;
      }

      let decryptedAccount: EmailAccount;
      try {
        const credentials = decryptObject((acc as any).credentials as unknown as string);
        if (!credentials || (!credentials.accessToken && !credentials.password)) {
          console.warn(`[Sync] Account ${(acc as any).email} has missing or malformed credentials.`);
          return;
        }
        decryptedAccount = { ...(acc as any), credentials } as unknown as EmailAccount;
      } catch (decryptErr) {
        console.error(`[Sync] Critical decryption failure for ${(acc as any).email}:`, decryptErr);
        return;
      }

      const provider = createProvider(decryptedAccount);
      
      const latest = await db().from('email_cache').select('normalized_data').eq('account_id', accountId).order('fetched_at', { ascending: false }).limit(1).single();
      const after = (latest as any).data ? ((latest as any).data.normalized_data as any).receivedAt : undefined;

      // Sync major system labels
      const labelsToSync = ['INBOX', 'SPAM', 'TRASH', 'SENT', 'DRAFT'];
      
      for (const labelId of labelsToSync) {
        try {
          console.log(`[Sync] Syncing ${decryptedAccount.email} label: ${labelId}...`);
          const fresh = await provider.listMessages({ maxResults: 40, after, labelId });

          if (fresh.length > 0) {
            console.log(`[Sync] Found ${fresh.length} new messages in ${labelId} for ${decryptedAccount.email}`);
            const cacheEntries = fresh.map(m => ({
              account_id: accountId,
              provider_message_id: m.providerMessageId,
              normalized_data: m as any,
              fetched_at: new Date().toISOString()
            }));
            
            await (db() as any).from('email_cache').upsert(cacheEntries as any, { onConflict: 'account_id,provider_message_id' });

            // IMMEDIATE priority for fresh mail
            const { triggerEmailIndexing } = await import('@/app/api/email/list/route_utils');
            triggerEmailIndexing(accountId, fresh);
          }
        } catch (labelErr: any) {
          if (labelErr.message?.includes('401')) {
            console.error(`[Sync] Auth failure for ${decryptedAccount.email} (${labelId}). Refresh token present: ${!!decryptedAccount.credentials.refreshToken}`);
          } else {
            console.warn(`[Sync] Failed to sync label ${labelId} for ${accountId}:`, labelErr.message);
          }
        }
      }
    } catch (err: any) {
      console.error(`[Sync] Unexpected error syncing account ${accountId}:`, err.message);
    }
  }
}

export function initBackgroundSync() {
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_BACKGROUND_SYNC === 'true') {
    BackgroundSyncService.getInstance().start();
  }
}
