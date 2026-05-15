import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callAI } from '@/lib/ai/client';
import { getSessionUser } from '@/lib/security/session';
import { createEmbedding, searchEmailsVector } from '@/lib/ai/embeddings';
import { db } from '@/lib/db/client';

const ChatSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

/**
 * POST /api/ai/chat
 * 
 * Advanced AI agent with Query Expansion and Hybrid Memory RAG.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, errorResponse } = await getSessionUser();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const validated = ChatSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { message, history = [] } = validated.data;

    // 1. QUERY EXPANSION (Memory System)
    // If there is history, ask the AI to generate a standalone search query.
    // This resolves references like "him", "that email", "last week", etc.
    let searchQuery = message;
    if (history.length > 0) {
      const expansionPrompt = `Given the following conversation history and a new user message, 
generate a concise, standalone search query that captures the user's intent for searching an email inbox.
Resolve any pronouns or references based on the context.

HISTORY:
${history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

NEW MESSAGE: ${message}

STANDALONE QUERY:`;

      const expanded = await callAI([
        { role: 'system', content: 'You are a search query optimizer. Return only the optimized query.' },
        { role: 'user', content: expansionPrompt }
      ], { temperature: 0, maxTokens: 50 });
      
      searchQuery = expanded.trim().replace(/^"|"$/g, '');
      console.log(`[AI] Expanded query: "${searchQuery}"`);
    }

    // 2. RETRIEVAL (Vector + Hybrid)
    let context = '';
    try {
      const queryEmbedding = await createEmbedding(searchQuery);
      const vectorResults = await searchEmailsVector(queryEmbedding, userId, 7);
      
      if (vectorResults && vectorResults.length > 0) {
        context += vectorResults.map((r: any) => `[RELEVANT EMAIL] CONTENT: ${r.content}\n---\n`).join('\n');
      }
    } catch (e) {
      console.warn('[AI] Semantic search failed, falling back.');
    }

    // Keyword fallback if context is empty
    if (!context) {
      const firstWord = searchQuery.split(' ')[0];
      const { data: keywords } = await db()
        .from('email_cache')
        .select('normalized_data')
        .or(`normalized_data->>subject.ilike.%${firstWord}%,normalized_data->>from.ilike.%${firstWord}%`)
        .limit(5);

      if (keywords && keywords.length > 0) {
        context += keywords.map((e: any) => {
          const m = e.normalized_data;
          return `[MATCHING EMAIL] FROM: ${m.from}\nSUBJECT: ${m.subject}\nSNIPPET: ${m.snippet}\n---\n`;
        }).join('\n');
      }
    }

    // 3. REASONING
    const systemPrompt = `You are an elite AI Email Assistant. 
You have access to a context-aware memory of the user's inbox.
Use the provided CONTEXT to answer the user's question accurately.

If you don't find a direct match, explain what you searched for (query: "${searchQuery}") 
and offer to search for something else.

CONTEXT:
${context || 'No matching emails found.'}

Tone: Professional, smart, concise.`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role as any, content: h.content })),
      { role: 'user', content: message }
    ];

    const response = await callAI(aiMessages, { temperature: 0.3, maxTokens: 800 });

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('[API] Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
