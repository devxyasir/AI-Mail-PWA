import { db } from '@/lib/db/client';
import type { NormalizedEmailMessage } from '@/lib/email/types';

// Force re-build trigger: High-performance intelligence worker v1.0.1
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 10));

/**
 * High-speed background worker for indexing and prioritization.
 * Optimized to prevent event loop starvation by yielding to the main thread.
 */
export async function triggerEmailIndexing(accountId: string, messages: NormalizedEmailMessage[]) {
  // Give the web server a head start to finish the response
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const { createEmbedding } = await import('@/lib/ai/embeddings');
    const { calculatePriority } = await import('@/lib/ai/priority');

    // 1. Check for existing priorities in BATCH
    const providerIds = messages.map(m => m.providerMessageId);
    const { data: existingData } = await db()
      .from('email_ai_data')
      .select('provider_message_id, priority_label, priority_score')
      .eq('account_id', accountId)
      .in('provider_message_id', providerIds);

    const existingMap = new Map((existingData as any[])?.map(d => [d.provider_message_id, d]) || []);

    // 2. Process Priorities (SEQUENTIAL with Yields to avoid blocking)
    const priorityResults: NormalizedEmailMessage[] = [];
    
    for (const m of messages) {
      try {
        const existing = existingMap.get(m.providerMessageId);
        
        if (existing?.priority_label && existing?.priority_score !== undefined) {
          priorityResults.push({ ...m, priority: existing.priority_label });
          continue;
        }

        // yield to event loop before every heavy AI call
        await yieldToMain();

        console.log(`[AI] Background Analyzing: "${m.subject.substring(0, 30)}..."`);
        const p = await calculatePriority(m.from, m.subject, m.snippet, m.labels);
        
        await (db() as any).from('email_ai_data').upsert({
          account_id: accountId,
          provider_message_id: m.providerMessageId,
          priority_score: p.score,
          priority_label: p.label,
          category: p.category
        } as any, { onConflict: 'account_id,provider_message_id' });

        priorityResults.push({ ...m, priority: p.label });
      } catch (err) {
        console.error(`[AI] Background Priority failed:`, err);
        priorityResults.push({ ...m, priority: 'low' });
      }
    }

    // 3. Process Embeddings (Semantic Search)
    const priorityMap: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sortedForEmbeddings = [...priorityResults].sort((a, b) => 
      (priorityMap[a.priority as string] ?? 2) - (priorityMap[b.priority as string] ?? 2)
    );

    // Only index the top 5 most important messages per request to save resources
    const embeddingBatch = sortedForEmbeddings.slice(0, 5);

    for (const m of embeddingBatch) {
      try {
        await yieldToMain(); // yielding

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
        console.warn(`[AI] Embedding failed:`, err);
      }
    }
  } catch (e) {
    console.error('[AI] Background worker error:', e);
  }
}
