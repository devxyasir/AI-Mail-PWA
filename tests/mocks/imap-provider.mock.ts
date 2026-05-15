import { vi } from 'vitest';

export const mockImapProvider = {
  listMessages: vi.fn().mockResolvedValue([]),
  getMessage: vi.fn().mockResolvedValue({}),
  listLabels: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn().mockResolvedValue(undefined),
  markAsRead: vi.fn().mockResolvedValue(undefined),
  markAsStarred: vi.fn().mockResolvedValue(undefined),
  deleteMessage: vi.fn().mockResolvedValue(undefined),
};
