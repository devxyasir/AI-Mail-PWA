/**
 * Supabase database client singleton for all server-side code.
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  Database, 
  DbEmailAccount, 
  DbEmailAccountInsert,
  DbEmailCache,
  DbEmailCacheInsert,
  DbLabel,
  DbLabelInsert,
  DbAiMetadata,
  DbDraft,
  DbDraftInsert
} from './schema';

export type { 
  DbEmailAccount, 
  DbEmailAccountInsert,
  DbEmailCache,
  DbEmailCacheInsert,
  DbLabel,
  DbLabelInsert,
  DbAiMetadata,
  DbDraft,
  DbDraftInsert
};

let instance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Return the shared, typed Supabase client.
 */
export function getSupabaseClient(): ReturnType<typeof createClient<Database>> {
  if (instance) return instance;

  let url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!url || !key) {
    throw new Error('Supabase URL and Key are required');
  }

  instance = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: { schema: 'public' },
  });

  return instance;
}

export const db = getSupabaseClient;

/**
 * Fetch all connected accounts belonging to a given user.
 */
export async function getAccountsByUser(userId: string): Promise<DbEmailAccount[]> {
  const { data, error } = await db().from('email_accounts').select('*').eq('user_id', userId);
  if (error) {
    console.error('[db] getAccountsByUser:', error);
    return [];
  }
  return (data || []) as DbEmailAccount[];
}

/**
 * Fetch a specific connected account by ID.
 */
export async function getAccountById(id: string): Promise<DbEmailAccount | null> {
  const { data, error } = await db().from('email_accounts').select('*').eq('id', id).single();
  if (error) {
    console.error('[db] getAccountById:', error);
    return null;
  }
  return data as DbEmailAccount;
}

/**
 * Delete a specific connected account by ID.
 */
export async function deleteAccount(id: string): Promise<boolean> {
  const { error } = await db().from('email_accounts').delete().eq('id', id);
  if (error) {
    console.error('[db] deleteAccount:', error);
    return false;
  }
  return true;
}

/**
 * Add or update an email account for a user.
 */
export async function addOrUpdateAccount({
  userId,
  email,
  provider,
  providerAccountId,
  credentials,
  name,
  avatarUrl
}: {
  userId: string;
  email: string;
  provider: string;
  providerAccountId: string;
  credentials: any;
  name?: string;
  avatarUrl?: string;
}) {
  const { encryptObject } = await import('@/lib/security/encrypt');
  const encryptedCredentials = encryptObject(credentials);

  const { data, error } = await (db() as any)
    .from('email_accounts')
    .upsert(
      {
        user_id: userId,
        email,
        provider: provider as any,
        provider_account_id: providerAccountId,
        credentials: encryptedCredentials as any,
        display_name: name,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      } as any,
      { onConflict: 'user_id,email' }
    )
    .select()
    .single();

  if (error) {
    console.error('[db] addOrUpdateAccount:', error);
    throw error;
  }
  return data;
}

/**
 * Update credentials for an existing account (e.g. after a token refresh).
 */
export async function updateAccountCredentials(accountId: string, credentials: any) {
  const { encryptObject } = await import('@/lib/security/encrypt');
  const encryptedCredentials = encryptObject(credentials);

  const { error } = await (db() as any)
    .from('email_accounts')
    .update({ 
      credentials: encryptedCredentials as any,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', accountId);

  if (error) {
    console.error('[db] updateAccountCredentials:', error);
    throw error;
  }
  return true;
}


/**
 * Persist AI-generated data (summary, priority) for a specific email message.
 */
export async function upsertAiData(
  accountId: string,
  messageId: string,
  data: {
    summary?: string;
    priorityScore?: number;
    priorityLabel?: string;
    category?: string;
  }
): Promise<boolean> {
  const row = {
    account_id: accountId,
    provider_message_id: messageId,
    summary: data.summary,
    priority_score: data.priorityScore,
    priority_label: data.priorityLabel as any,
    category: data.category,
    updated_at: new Date().toISOString()
  };

  const { error } = await (db() as any)
    .from('email_ai_data')
    .upsert(row, { onConflict: 'account_id,provider_message_id' });

  if (error) {
    console.error('[db] upsertAiData:', error);
    return false;
  }
  return true;
}

/**
 * Retrieve persisted AI data for a message.
 */
export async function getAiData(accountId: string, messageId: string): Promise<any> {
  const { data, error } = await (db() as any)
    .from('email_ai_data')
    .select('*')
    .eq('account_id', accountId)
    .eq('provider_message_id', messageId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[db] getAiData:', error);
  }
  return data;
}

/**
 * Fetch labels for a given account.
 */
export async function getLabelsByAccount(accountId: string) {
  const { data, error } = await db().from('labels').select('*').eq('account_id', accountId);
  if (error) {
    console.error('[db] getLabelsByAccount:', error);
    return [];
  }
  return data ?? [];
}

/**
 * Fetch all drafts for a user.
 */
export async function getDraftsByUser(userId: string): Promise<DbDraft[]> {
  const { data, error } = await db().from('drafts').select('*').eq('user_id', userId);
  if (error) {
    console.error('[db] getDraftsByUser:', error);
    return [];
  }
  return (data || []) as DbDraft[];
}

/**
 * Upsert a draft.
 */
export async function upsertDraft(draft: DbDraftInsert & { id?: string | null }) {
  const { id, ...rest } = draft;
  const row: any = {
    ...rest,
    updated_at: new Date().toISOString()
  };

  // Only include ID if it's a valid non-null string
  if (id && typeof id === 'string' && id.trim() !== '') {
    row.id = id;
  }

  const { data, error } = await (db() as any)
    .from('drafts')
    .upsert(row)
    .select()
    .single();

  if (error) {
    console.error('[db] upsertDraft:', error);
    throw error;
  }
  return data as DbDraft;
}

/**
 * Delete a draft.
 */
export async function deleteDraft(id: string) {
  const { error } = await db().from('drafts').delete().eq('id', id);
  if (error) {
    console.error('[db] deleteDraft:', error);
    return false;
  }
  return true;
}
