import { describe, it, expect, vi } from 'vitest';
import { generateReplyDraft } from '@/lib/ai/reply-draft';

vi.mock('@/lib/ai/client', () => ({
  callAI: vi.fn().mockResolvedValue('Mocked AI Draft Reply')
}));

describe('AI Reply Draft', () => {
  it('should generate a reply draft', async () => {
    const draft = await generateReplyDraft('Subject', 'Body');
    expect(draft).toBe('Mocked AI Draft Reply');
  });
});
