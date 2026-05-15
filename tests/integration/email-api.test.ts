import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as listGET } from '../../app/api/email/list/route';
import { GET as itemGET } from '../../app/api/email/[id]/route';
import { POST as archivePOST } from '../../app/api/email/[id]/archive/route';
import { DELETE as deleteDELETE } from '../../app/api/email/[id]/delete/route';
import { GET as searchGET } from '../../app/api/email/search/route';
import { NextRequest } from 'next/server';
import { getAccountsByUser, getAccountById } from '../../lib/db/client';
import { createProvider } from '../../lib/email/providers/registry';
import { getSessionUser } from '../../lib/security/session';
import type { DbEmailAccount } from '@/lib/db/schema';

// Mock DB and Registry
vi.mock('../../lib/db/client', () => ({
  db: vi.fn(),
  getAccountsByUser: vi.fn(),
  getAccountById: vi.fn(),
}));

vi.mock('../../lib/email/providers/registry', () => ({
  createProvider: vi.fn(),
}));

vi.mock('../../lib/security/session', () => ({
  getSessionUser: vi.fn(() => Promise.resolve({
    userId: '00000000-0000-0000-0000-000000000000',
    errorResponse: null,
  })),
}));

const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

vi.mock('../../lib/security/encrypt', () => ({
  decryptObject: (obj: unknown) => obj,
}));

describe('Email API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/email/list', () => {
    it('should return 400 for invalid query params', async () => {
      const req = new NextRequest('http://localhost/api/email/list?limit=invalid');
      const res = await listGET(req);
      expect(res.status).toBe(400);
    });

    it('should return empty list when no accounts found', async () => {
      vi.mocked(getAccountsByUser).mockResolvedValue([]);
      
      const req = new NextRequest('http://localhost/api/email/list');
      const res = await listGET(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.messages).toEqual([]);
    });

    it('should fetch from multiple accounts and merge', async () => {
      const mockAccounts = [
        { id: 'acc1', user_id: TEST_USER_ID, provider: 'gmail', credentials: {} },
        { id: 'acc2', user_id: TEST_USER_ID, provider: 'microsoft', credentials: {} }
      ] as DbEmailAccount[];
      vi.mocked(getAccountsByUser).mockResolvedValue(mockAccounts);
      
      const mockProvider = {
        listMessages: vi.fn().mockResolvedValue([{ id: 'm1', receivedAt: new Date().toISOString() }]),
      };
      vi.mocked(createProvider).mockReturnValue(mockProvider as any);

      const req = new NextRequest('http://localhost/api/email/list');
      const res = await listGET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.messages).toHaveLength(2);
      expect(mockProvider.listMessages).toHaveBeenCalledTimes(2);
    });
  });

  describe('GET /api/email/search', () => {
    it('should call listGET with search query', async () => {
       // Search is just a re-export of listGET
       expect(searchGET).toBe(listGET);
    });
  });

  describe('POST /api/email/[id]/archive', () => {
    it('should archive a message', async () => {
      const compositeId = Buffer.from('acc123:msg456').toString('base64url');
      vi.mocked(getAccountById).mockResolvedValue({ id: 'acc123', user_id: TEST_USER_ID, credentials: {} } as any);
      
      const mockProvider = { archiveMessage: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(createProvider).mockReturnValue(mockProvider as any);

      const req = new NextRequest(`http://localhost/api/email/${compositeId}/archive`, { method: 'POST' });
      const res = await archivePOST(req, { params: { id: compositeId } });
      
      expect(res.status).toBe(200);
      expect(mockProvider.archiveMessage).toHaveBeenCalledWith('msg456');
    });
  });

  describe('DELETE /api/email/[id]/delete', () => {
    it('should delete a message', async () => {
      const compositeId = Buffer.from('acc123:msg456').toString('base64url');
      vi.mocked(getAccountById).mockResolvedValue({ id: 'acc123', user_id: TEST_USER_ID, credentials: {} } as any);
      
      const mockProvider = { deleteMessage: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(createProvider).mockReturnValue(mockProvider as any);

      const req = new NextRequest(`http://localhost/api/email/${compositeId}/delete`, { method: 'DELETE' });
      const res = await deleteDELETE(req, { params: { id: compositeId } });
      
      expect(res.status).toBe(200);
      expect(mockProvider.deleteMessage).toHaveBeenCalledWith('msg456');
    });
  });
});
