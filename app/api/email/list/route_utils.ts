import { db } from '@/lib/db/client';
import type { NormalizedEmailMessage } from '@/lib/email/types';

/**
 * High-speed background worker for indexing and prioritization.
 */
export async function triggerEmailIndexing(accountId: string, messages: NormalizedEmailMessage[]) {
  try {
    const { createEmbedding } = await import('@/lib/ai/embeddings');
    const { calculatePriority } = await import('@/lib/ai/priority');

    // 1. Process Priorities FIRST (Cheaper and faster)
    const priorityResults = await Promise.all(messages.map(async (m) => {
      try {
        console.log(`[AI] Analyzing: "${m.subject.substring(0, 30)}..."`);
        
        // Check if already prioritized to avoid redundant AI calls
        const { data: existing } = await db()
          .from('email_ai_data')
          .select('priority_label, priority_score')
          .eq('account_id', accountId)
          .eq('provider_message_id', m.providerMessageId)
          .single() as any;

        if (existing?.priority_label && existing?.priority_score !== undefined) {
          return { ...m, priority: existing.priority_label };
        }

        const { calculatePriority } = await import('@/lib/ai/priority');
        const p = await calculatePriority(m.from, m.subject, m.snippet, m.labels);
        console.log(`[AI] Priority for "${m.providerMessageId}": ${p.label} (${p.score})`);
        
        await (db() as any).from('email_ai_data').upsert({
          account_id: accountId,
          provider_message_id: m.providerMessageId,
          priority_score: p.score,
          priority_label: p.label,
          category: p.category
        } as any, { onConflict: 'account_id,provider_message_id' });

        return { ...m, priority: p.label };
      } catch (err) {
        console.error(`[AI] Priority failed for ${m.providerMessageId}:`, err);
        return { ...m, priority: 'medium' };
      }
    }));

    // 2. Process Embeddings (Semantic Search)
    // We prioritize Urgent/High messages for embedding generation
    const priorityMap: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sortedForEmbeddings = [...priorityResults].sort((a, b) => 
      (priorityMap[a.priority as string] ?? 2) - (priorityMap[b.priority as string] ?? 2)
    );

    // Limit embedding generation to avoid hitting rate limits too hard
    // We only do embeddings for the most important ones in each batch if it's large
    const embeddingBatch = sortedForEmbeddings.slice(0, 20);

    for (const m of embeddingBatch) {
      try {
        // Check if already indexed
        const { data: existing } = await db()
          .from('email_embeddings')
          .select('provider_message_id')
          .eq('account_id', accountId)
          .eq('provider_message_id', m.providerMessageId)
          .single();

        if (existing) continue;

        const content = `Subject: ${m.subject}\nFrom: ${m.from}\nDate: ${m.receivedAt}\nSnippet: ${m.snippet}\n${m.body || ''}`;
        const embedding = await createEmbedding(content);
        
        await (db() as any).from('email_embeddings').upsert({
          account_id: accountId,
          provider_message_id: m.providerMessageId,
          embedding,
          content: content.substring(0, 5000),
          updated_at: new Date().toISOString()
        } as any, { onConflict: 'account_id,provider_message_id' });
      } catch (err) {
        console.warn(`[AI] Embedding failed for ${m.providerMessageId}:`, err);
      }
    }
  } catch (e) {
    console.error('[AI] Background worker error:', e);
  }
}
