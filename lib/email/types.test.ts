/**
 * Email types — type-only module re-exporting from lib/email/types.ts.
 *
 * This barrel file exists so the app layer can import types without
 * reaching into the lib directory structure directly.
 */
export type {
  ProviderType,
  NormalizedEmailMessage,
  EmailAttachment,
  EmailLabel,
  EmailDraft,
  ListOptions,
  EmailAccount,
  EmailListResponse,
  InboxError,
  ProviderRateLimitError,
  ProviderAuthError,
  ProviderConnectionError,
} from '@/lib/email/types';