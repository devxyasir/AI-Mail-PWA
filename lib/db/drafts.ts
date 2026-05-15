import { db } from './client';
import type { EmailDraft } from '../email/types';

export async function saveDraft(draft: EmailDraft) {
  const { data, error } = await (db() as any)
    .from('drafts')
    .upsert({
      id: draft.id || undefined,
      user_id: draft.userId,
      account_id: draft.accountId,
      to_emails: draft.to,
      cc_emails: draft.cc,
      bcc_emails: draft.bcc,
      subject: draft.subject,
      body: draft.body,
      type: draft.type,
      original_id: draft.originalId,
      updated_at: new Date().toISOString()
    } as any)
    .select()
    .single();

  if (error) {
    console.error('[db] saveDraft error:', error);
    throw error;
  }
  return data;
}

export async function getDraft(id: string) {
  const { data, error } = await db()
    .from('drafts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[db] getDraft error:', error);
    return null;
  }
  return data;
}
