import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculatePriority } from '@/lib/ai/priority';
import { rateLimit } from '@/lib/security/rate-limit';
import { getSessionUser } from '@/lib/security/session';
import { upsertAiData, getAiData } from '@/lib/db/client';

const PrioritySchema = z.object({
  from: z.string(),
  subject: z.string(),
  snippet: z.string(),
  labels: z.array(z.string()).optional(),
  accountId: z.string().optional(),
  messageId: z.string().optional(),
});

/**
 * POST /api/ai/priority
 * 
 * Calculates and returns a priority score and intelligence label for an email.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const limiter = rateLimit(ip, { limit: 50, windowMs: 60 * 1000 });
    
    if (!limiter.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { errorResponse } = await getSessionUser();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const validated = PrioritySchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validated.error.format() }, { status: 400 });
    }

    const aiConfig = {
      apiKey: request.headers.get('x-ai-api-key') || undefined,
      baseUrl: request.headers.get('x-ai-base-url') || undefined,
      model: request.headers.get('x-ai-model') || undefined,
    };

    const { from, subject, snippet, labels, accountId, messageId } = validated.data;

    // Check cache
    if (accountId && messageId) {
      const existing = await getAiData(accountId, messageId);
      if (existing && existing.priority_label) {
        // Map score to category for consistency in response
        const score = existing.priority_score || 0;
        let category: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (score >= 90) category = 'URGENT';
        else if (score >= 80) category = 'HIGH';
        else if (score >= 40) category = 'MEDIUM';

        return NextResponse.json({ 
          score, 
          label: existing.priority_label,
          category,
          reason: 'Cached from database',
          cached: true
        });
      }
    }

    const priority = await calculatePriority(from, subject, snippet, labels || [], aiConfig);

    // Save to DB
    if (accountId && messageId) {
      await upsertAiData(accountId, messageId, { 
        priorityScore: priority.score, 
        priorityLabel: priority.label,
        category: priority.category
      });
    }

    return NextResponse.json(priority);
  } catch (error) {
    console.error('[API] Priority error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
