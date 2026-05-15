import { EmailProviderAdapter } from '../provider-adapter';
import { 
  NormalizedEmailMessage, 
  EmailLabel, 
  ListOptions,
  EmailAccount
} from '../types';
import {
  ProviderRateLimitError,
  ProviderAuthError,
  ProviderConnectionError,
} from '../types';

/**
 * Common helper to handle rate limits from HTTP-based providers.
 */
export function handleRateLimit(source: any, retryAfterMs?: number): never {
  const msg = typeof source === 'string' 
      ? source 
      : `Provider rate limit: ${source.status} ${source.statusText}`;
  throw new ProviderRateLimitError(msg, retryAfterMs);
}

/**
 * Common helper to handle auth errors.
 */
export function handleAuthError(source: any): never {
  const msg = typeof source === 'string' 
      ? source 
      : `Provider auth error: ${source.status} ${source.statusText}`;
  throw new ProviderAuthError(msg);
}

/**
 * Base class for email providers to handle shared logic like credential 
 * encryption and common error handling.
 */
export abstract class BaseEmailProvider implements EmailProviderAdapter {
  protected account: EmailAccount;

  constructor(account: EmailAccount) {
    this.account = account;
  }

  /** @inheritDoc */
  abstract listMessages(options?: ListOptions): Promise<NormalizedEmailMessage[]>;

  /** @inheritDoc */
  abstract getMessage(id: string): Promise<NormalizedEmailMessage>;

  /** @inheritDoc */
  abstract listLabels(): Promise<EmailLabel[]>;

  /** @inheritDoc */
  abstract sendMessage(message: Partial<NormalizedEmailMessage>): Promise<void>;

  /** @inheritDoc */
  abstract replyMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void>;

  /** @inheritDoc */
  abstract forwardMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void>;

  /** @inheritDoc */
  abstract archiveMessage(id: string): Promise<void>;

  /** @inheritDoc */
  abstract deleteMessage(id: string): Promise<void>;

  /** @inheritDoc */
  abstract searchMessages(query: string): Promise<NormalizedEmailMessage[]>;

  /** @inheritDoc */
  abstract updateMessageLabels(id: string, add?: string[], remove?: string[]): Promise<void>;

  /** @inheritDoc */
  abstract markAsRead(id: string, read: boolean): Promise<void>;

  /** @inheritDoc */
  abstract markAsStarred(id: string, starred: boolean): Promise<void>;
}