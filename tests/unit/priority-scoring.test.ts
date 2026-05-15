import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatePriority } from '@/lib/ai/priority';
import { callAI } from '@/lib/ai/client';

vi.mock('@/lib/ai/client', () => ({
  callAI: vi.fn(),
}));

describe('Priority Scoring Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Deterministic Rules', () => {
    it('should classify security alerts as URGENT', async () => {
      const result = await calculatePriority('system@auth.com', 'Security alert: Unrecognized login', 'We detected a new login...', []);
      expect(result.category).toBe('URGENT');
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('should classify social notifications as LOW', async () => {
      const result = await calculatePriority('notifications@linkedin.com', 'John Doe sent you a message', 'Check your messages...', ['SOCIAL']);
      expect(result.category).toBe('LOW');
      expect(result.label).toBe('social');
    });

    it('should classify newsletters as LOW/DIGEST', async () => {
      const result = await calculatePriority('news@techcrunch.com', 'Weekly Tech Update', 'Here is what happened...', ['PROMOTIONS']);
      expect(result.category).toBe('LOW');
      expect(result.label).toBe('digest');
    });

    it('should classify receipts as LOW/RECEIPT', async () => {
      const result = await calculatePriority('billing@aws.com', 'Your Invoice for March', 'Total amount: $10.00', []);
      expect(result.category).toBe('LOW');
      expect(result.label).toBe('receipt');
    });
  });

  describe('AI Scoring (Mocked)', () => {
    it('should handle urgent human requests via AI', async () => {
      vi.mocked(callAI).mockResolvedValue(JSON.stringify({ 
        score: 95, 
        label: 'urgent', 
        reason: 'CEO asking for ASAP report' 
      }));

      const result = await calculatePriority('ceo@company.com', 'Urgent: Q1 Report needed ASAP', 'Please send the report by EOD.', []);
      expect(result.category).toBe('URGENT');
      expect(result.score).toBe(95);
    });

    it('should handle normal work updates as MEDIUM', async () => {
      vi.mocked(callAI).mockResolvedValue(JSON.stringify({ 
        score: 55, 
        label: 'direct', 
        reason: 'Regular project sync' 
      }));

      const result = await calculatePriority('colleague@company.com', 'Project Sync', 'Just wanted to check on progress.', []);
      expect(result.category).toBe('MEDIUM');
      expect(result.score).toBe(55);
    });
  });
});
