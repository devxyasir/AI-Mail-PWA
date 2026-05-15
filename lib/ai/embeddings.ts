import { pipeline } from '@xenova/transformers';

/**
 * Singleton for the embedding pipeline to avoid reloading the model.
 */
let embeddingPipeline: any = null;

async function getPipeline() {
  if (!embeddingPipeline) {
    console.log('[AI] Loading local embedding model (sentence-transformers/all-MiniLM-L6-v2)...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[AI] Local embedding model loaded.');
  }
  return embeddingPipeline;
}

/**
 * Helpers for generating vector embeddings locally using Transformers.js.
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await getPipeline();
    
    // Generate embeddings
    const output = await extractor(text.substring(0, 5000), {
      pooling: 'mean',
      normalize: true,
    });

    // Convert Tensor to array
    return Array.from(output.data) as number[];
  } catch (error: any) {
    console.error(`[AI] Local Embedding failed:`, error.message);
    throw error;
  }
}

/**
 * Searches for relevant emails using vector similarity.
 */
export async function searchEmailsVector(queryEmbedding: number[], userId: string, limit = 5) {
  const { db } = await import('@/lib/db/client');
  
  const { data, error } = await (db() as any).rpc('match_emails', {
    query_embedding: queryEmbedding,
    match_threshold: 0.3, 
    match_count: limit,
  });

  if (error) {
    console.error('[DB] Vector search error:', error);
    return [];
  }

  return data;
}
