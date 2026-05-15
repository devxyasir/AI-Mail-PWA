/**
 * Singleton for the embedding pipeline to avoid reloading the model.
 */
let embeddingPipeline: any = null;

async function getPipeline() {
  if (process.env.NODE_ENV === 'production') {
    // Local embeddings are heavy and often fail on Vercel due to memory/timeout.
    // In production, we skip them unless we switch to an API-based service.
    return null;
  }

  try {
    const { pipeline, env } = await import('@xenova/transformers');
    
    // Configure for serverless environment
    env.allowLocalModels = false;
    env.useBrowserCache = false;

    if (!embeddingPipeline) {
      console.log('[AI] Loading local embedding model...');
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('[AI] Local embedding model loaded.');
    }
    return embeddingPipeline;
  } catch (err) {
    console.error('[AI] Failed to load embedding pipeline:', err);
    return null;
  }
}

/**
 * Helpers for generating vector embeddings locally using Transformers.js.
 */
export async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    const extractor = await getPipeline();
    if (!extractor) return null;
    
    // Generate embeddings
    const output = await extractor(text.substring(0, 5000), {
      pooling: 'mean',
      normalize: true,
    });

    // Convert Tensor to array
    return Array.from(output.data) as number[];
  } catch (error: any) {
    console.error(`[AI] Local Embedding failed:`, error.message);
    return null;
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
