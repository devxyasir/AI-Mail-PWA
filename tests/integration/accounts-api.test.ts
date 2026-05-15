import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as listGET, POST as listPOST } from '../../app/api/accounts/route';
import { GET as itemGET, PATCH as itemPATCH, DELETE as itemDELETE } from '../../app/api/accounts/[id]/route';
import { NextRequest } from 'next/server';
import { getAccountsByUser, getAccountById, upsertAccount, deleteAccount } from '../../lib/db/client';
import { decrypt } from '../../lib/security/encrypt';
import { getSessionUser } from '../../lib/security/session';
import type { DbEmailAccount } from '@/lib/db/schema';

// Mock DB and Security
vi.mock('../../lib/db/client', () => ({
  getAccountsByUser: vi.fn(),
  getAccountById: vi.fn(),
  upsertAccount: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock('../../lib/security/session', () => ({
  getSessionUser: vi.fn(() => Promise.resolve({
    userId: '00000000-0000-0000-0000-000000000000',
    errorResponse: null,
  })),
}));

const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

describe('Accounts API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CREDENTIAL_ENCRYPTION_KEY = 'test-key-32-chars-long-exactly!!!';
  });

  describe('POST /api/accounts', () => {
    it('should encrypt credentials before saving', async () => {
      const rawCredentials = { accessToken: 'secret-token' };
      const accountData = {
        provider: 'gmail',
        email: 'test@gmail.com',
        providerAccountId: 'google-123',
        credentials: rawCredentials,
      };

      vi.mocked(upsertAccount).mockImplementation((acc) => Promise.resolve({ ...acc, id: 'new-id' } as DbEmailAccount));

      const req = new NextRequest('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify(accountData),
      });

      const res = await listPOST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.credentials).toEqual({}); // Sanitized in response
      
      // Check what was sent to DB
      const dbCall = vi.mocked(upsertAccount).mock.calls[0][0];
      const encryptedToken = (dbCall.credentials as Record<string, string>).accessToken;
      expect(encryptedToken).not.toBe('secret-token');
      expect(encryptedToken).toContain(':');
      
      const decrypted = decrypt(encryptedToken);
      expect(decrypted).toBe('secret-token');
    });
  });

  describe('GET /api/accounts', () => {
    it('should return sanitized accounts', async () => {
      const mockAccounts = [
        { id: '1', user_id: TEST_USER_ID, email: 'a@a.com', credentials: { accessToken: 'encrypted' } },
      ] as DbEmailAccount[];
      vi.mocked(getAccountsByUser).mockResolvedValue(mockAccounts);

      const res = await listGET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data[0].credentials).toEqual({});
      expect(data[0].email).toBe('a@a.com');
    });
  });

  describe('GET /api/accounts/[id]', () => {
    it('should return a sanitized single account', async () => {
      const mockAccount = { id: '1', user_id: TEST_USER_ID, email: 'a@a.com', credentials: { accessToken: 'encrypted' } } as DbEmailAccount;
      vi.mocked(getAccountById).mockResolvedValue(mockAccount);

      const res = await itemGET(new NextRequest('http://localhost/api/accounts/1'), { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.credentials).toEqual({});
      expect(data.id).toBe('1');
    });
  });

  describe('PATCH /api/accounts/[id]', () => {
    it('should update and re-encrypt credentials if provided', async () => {
      const existing = { id: '1', user_id: TEST_USER_ID, provider: 'imap', credentials: { imapPassword: 'old' } } as DbEmailAccount;
      vi.mocked(getAccountById).mockResolvedValue(existing);
      vi.mocked(upsertAccount).mockImplementation((acc) => Promise.resolve(acc as DbEmailAccount));

      const req = new NextRequest('http://localhost/api/accounts/1', {
        method: 'PATCH',
        body: JSON.stringify({ credentials: { imapPassword: 'new-password' } }),
      });

      const res = await itemPATCH(req, { params: { id: '1' } });
      expect(res.status).toBe(200);
      
      const dbCall = vi.mocked(upsertAccount).mock.calls[0][0];
      const encryptedToken = (dbCall.credentials as Record<string, string>).imapPassword;
      const decrypted = decrypt(encryptedToken);
      expect(decrypted).toBe('new-password');
    });
  });

  describe('DELETE /api/accounts/[id]', () => {
    it('should remove the account', async () => {
      const existing = { id: '1', user_id: TEST_USER_ID } as DbEmailAccount;
      vi.mocked(getAccountById).mockResolvedValue(existing);
      vi.mocked(deleteAccount).mockResolvedValue(true);

      const res = await itemDELETE(new NextRequest('http://localhost/api/accounts/1'), { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(deleteAccount).toHaveBeenCalledWith('1');
    });
  });
});
