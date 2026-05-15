import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as summarizePOST } from '../../app/api/ai/summarize/route';
import { POST as replyPOST } from '../../app/api/ai/reply-draft/route';
import { POST as priorityPOST } from '../../app/api/ai/priority/route';
import { NextRequest } from 'next/server';
import { callAI } from '../../lib/ai/client';
import { getSessionUser } from '../../lib/security/session';

vi.mock('../../lib/ai/client', () => ({
  callAI: vi.fn(),
}));

vi.mock('../../lib/security/session', () => ({
  getSessionUser: vi.fn(() => Promise.resolve({
    userId: '00000000-0000-0000-0000-000000000000',
    errorResponse: null,
  })),
}));

describe('AI API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/ai/summarize', () => {
    it('should return 400 for missing body', async () => {
      const req = new NextRequest('http://localhost/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ subject: 'Test' }), // Missing body
      });
      const res = await summarizePOST(req);
      expect(res.status).toBe(400);
    });

    it('should return 200 and summary on success', async () => {
      vi.mocked(callAI).mockResolvedValue('Short summary');
      
      const req = new NextRequest('http://localhost/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ subject: 'Test', body: 'Full content' }),
      });
      const res = await summarizePOST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.summary).toBe('Short summary');
    });
  });

  describe('POST /api/ai/reply-draft', () => {
    it('should return 200 and draft on success', async () => {
      vi.mocked(callAI).mockResolvedValue('Hello there');
      
      const req = new NextRequest('http://localhost/api/ai/reply-draft', {
        method: 'POST',
        body: JSON.stringify({ subject: 'Hi', body: 'How are you?' }),
      });
      const res = await replyPOST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.draft).toBe('Hello there');
    });
  });

  describe('POST /api/ai/priority', () => {
    it('should return 200 and priority results with category', async () => {
      vi.mocked(callAI).mockResolvedValue(JSON.stringify({ score: 75, label: 'direct', reason: 'Human contact' }));
      
      const req = new NextRequest('http://localhost/api/ai/priority', {
        method: 'POST',
        body: JSON.stringify({ from: 'a@a.com', subject: 'S', snippet: 'B' }),
      });
      const res = await priorityPOST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.score).toBe(75);
      expect(data.category).toBe('MEDIUM');
      expect(data.label).toBe('direct');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when limit exceeded', async () => {
      // The rate limiter is memory-based and shared. 
      // We can trigger it by calling many times.
      const ip = 'test-ip';
      const requests = Array.from({ length: 15 }).map(() => {
        const req = new NextRequest('http://localhost/api/ai/summarize', {
          method: 'POST',
          body: JSON.stringify({ subject: 'T', body: 'B' }),
          headers: { 'x-forwarded-for': ip }
        });
        return summarizePOST(req);
      });

      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);
      expect(statuses).toContain(429);
    });
  });
});
