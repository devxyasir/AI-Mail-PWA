/**
 * Core type definitions for normalized email data.
 */

export type ProviderType = 'gmail' | 'microsoft' | 'imap';

export interface NormalizedEmailMessage {
  id: string;
  providerMessageId: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body?: string;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments?: EmailAttachment[];
  priority?: 'urgent' | 'important' | 'direct' | 'digest' | 'receipt' | 'social' | 'low';
  aiScore?: number;
  aiSummary?: string;
  accountId?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
  isInline: boolean;
}

export interface EmailAccount {
  id: string;
  userId: string;
  email: string;
  provider: ProviderType;
  displayName?: string;
  avatarUrl?: string;
  credentials: any;
}

export interface EmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  color?: string;
  unreadCount?: number;
  totalCount?: number;
}

export interface ListOptions {
  labelId?: string;
  pageToken?: string;
  maxResults?: number;
  query?: string;
  after?: string;
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  type: 'new' | 'reply' | 'forward';
  originalId?: string;
  accountId: string;
  userId: string;
  id?: string;
}

// Custom Error Classes for Providers
export class ProviderRateLimitError extends Error {
  retryAfterMs?: number;
  constructor(message: string, retryAfterMs?: number) {
    super(message);
    this.name = 'ProviderRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class ProviderAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderAuthError';
  }
}

export class ProviderConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderConnectionError';
  }
}
