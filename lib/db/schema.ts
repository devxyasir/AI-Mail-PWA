/**
 * TypeScript type definitions for the AI Mail Supabase database schema.
 */

export type DbUser = {
  id: string;
  email: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  raw_user_meta_data: Record<string, unknown> | null;
  raw_app_meta_data: Record<string, unknown> | null;
  confirmed_at: string | null;
  recovery_sent_at: string | null;
  email_change: string | null;
  email_change_token_new: string | null;
  email_change_confirm_status: number | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  invited_at: string | null;
  invited_by: string | null;
  confirmation_token: string | null;
  recovery_token: string | null;
  email_change_token: string | null;
  refresh_token: string | null;
};

export type DbEmailAccount = {
  id: string;
  user_id: string;
  provider: 'gmail' | 'microsoft' | 'imap';
  provider_account_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  credentials: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type DbEmailAccountInsert = {
  user_id: string;
  provider: 'gmail' | 'microsoft' | 'imap';
  provider_account_id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  credentials: Record<string, unknown>;
};

export type DbEmailCache = {
  id: string;
  account_id: string;
  provider_message_id: string;
  normalized_data: Record<string, unknown>;
  fetched_at: string;
};

export type DbEmailCacheInsert = {
  account_id: string;
  provider_message_id: string;
  normalized_data: Record<string, unknown>;
};

export type DbLabel = {
  id: string;
  account_id: string;
  provider_label_id: string;
  name: string;
  color: string | null;
  type: 'system' | 'user';
  created_at: string;
  updated_at: string;
};

export type DbLabelInsert = {
  account_id: string;
  provider_label_id: string;
  name: string;
  color?: string;
  type: 'system' | 'user';
};

export type DbAiMetadata = {
  id: string;
  user_id: string;
  feature: 'summarise' | 'reply-draft' | 'priority' | 'priority-batch' | 'chat';
  account_id: string | null;
  message_id: string | null;
  requested_at: number;
  response_status: number;
  success: boolean;
  created_at: string;
};

export type DbEmailAiData = {
  id: string;
  account_id: string;
  provider_message_id: string;
  summary: string | null;
  priority_score: number | null;
  priority_label: 'low' | 'medium' | 'high' | 'urgent' | 'direct' | 'digest' | 'receipt' | 'social' | null;
  category: string | null;
  updated_at: string;
};

export type DbEmailEmbedding = {
  id: string;
  account_id: string;
  provider_message_id: string;
  embedding: number[];
  content: string | null;
  created_at: string;
};

export type DbDraft = {
  id: string;
  user_id: string;
  account_id: string;
  to_emails: string[];
  cc_emails: string[] | null;
  bcc_emails: string[] | null;
  subject: string | null;
  body: string | null;
  type: 'new' | 'reply' | 'forward';
  original_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbDraftInsert = {
  user_id: string;
  account_id: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject?: string;
  body?: string;
  type: 'new' | 'reply' | 'forward';
  original_id?: string;
};

export interface Database {
  public: {
    Tables: {
      email_accounts: {
        Row: DbEmailAccount;
        Insert: DbEmailAccountInsert;
        Update: Partial<DbEmailAccount>;
      };
      email_cache: {
        Row: DbEmailCache;
        Insert: DbEmailCacheInsert;
        Update: Partial<DbEmailCache>;
      };
      labels: {
        Row: DbLabel;
        Insert: DbLabelInsert;
        Update: Partial<DbLabel>;
      };
      ai_metadata: {
        Row: DbAiMetadata;
        Insert: Partial<DbAiMetadata>;
        Update: Partial<DbAiMetadata>;
      };
      email_ai_data: {
        Row: DbEmailAiData;
        Insert: Partial<DbEmailAiData> & { account_id: string; provider_message_id: string };
        Update: Partial<DbEmailAiData>;
      };
      email_embeddings: {
        Row: DbEmailEmbedding;
        Insert: Partial<DbEmailEmbedding> & { account_id: string; provider_message_id: string; embedding: number[] };
        Update: Partial<DbEmailEmbedding>;
      };
      drafts: {
        Row: DbDraft;
        Insert: DbDraftInsert;
        Update: Partial<DbDraft>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_emails: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          provider_message_id: string;
          account_id: string;
          content: string;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
