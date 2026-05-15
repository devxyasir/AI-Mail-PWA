import { describe, it, expect, vi } from 'vitest';
import { summarizeEmail } from '@/lib/ai/summarize';

vi.mock('@/lib/ai/client', () => ({
  callAI: vi.fn().mockResolvedValue('- Point 1\n- Point 2')
}));

describe('AI Summarize', () => {
  it('should summarize email', async () => {
    const summary = await summarizeEmail('Subject', 'Body');
    expect(summary).toBe('- Point 1\n- Point 2');
  });
});
