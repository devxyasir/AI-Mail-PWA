-- Supabase Schema for AI Mail PWA
-- Run this script in the Supabase SQL Editor to create the necessary tables.

-- 1. Create email_accounts table
CREATE TABLE IF NOT EXISTS public.email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'microsoft', 'imap')),
  provider_account_id TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  credentials JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON public.email_accounts(user_id);

-- 2. Create email_cache table
CREATE TABLE IF NOT EXISTS public.email_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  provider_message_id TEXT NOT NULL,
  normalized_data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, provider_message_id)
);

-- Index for fetching cached emails by account
CREATE INDEX IF NOT EXISTS idx_email_cache_account_id ON public.email_cache(account_id);

-- 3. Create labels table
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  provider_label_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  type TEXT NOT NULL CHECK (type IN ('system', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, provider_label_id)
);

-- 4. Create ai_metadata table
CREATE TABLE IF NOT EXISTS public.ai_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('summarise', 'reply-draft', 'priority', 'priority-batch', 'chat')),
  account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
  message_id TEXT,
  requested_at BIGINT NOT NULL,
  response_status INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create email_ai_data table
CREATE TABLE IF NOT EXISTS public.email_ai_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  provider_message_id TEXT NOT NULL,
  summary TEXT,
  priority_score INTEGER,
  priority_label TEXT CHECK (priority_label IN ('low', 'medium', 'high', 'urgent', 'direct', 'digest', 'receipt', 'social')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, provider_message_id)
);

-- Disable Row Level Security (RLS) for server-side NextAuth integration
ALTER TABLE public.email_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ai_data DISABLE ROW LEVEL SECURITY;

-- 6. Enable pgvector and create embeddings table
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the email_embeddings table (384-dim for Transformers.js models)
CREATE TABLE IF NOT EXISTS public.email_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  provider_message_id TEXT NOT NULL,
  embedding VECTOR(384), 
  content TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, provider_message_id)
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_email_embeddings_vector ON public.email_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Match function for RAG (Updated for 384-dim)
CREATE OR REPLACE FUNCTION match_emails (
  query_embedding VECTOR(384),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  provider_message_id TEXT,
  account_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.provider_message_id,
    e.account_id,
    e.content,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM email_embeddings e
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Disable RLS for embeddings
ALTER TABLE public.email_embeddings DISABLE ROW LEVEL SECURITY;

-- 7. Create drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT,
  body TEXT,
  type TEXT NOT NULL CHECK (type IN ('new', 'reply', 'forward')),
  original_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON public.drafts(user_id);
ALTER TABLE public.drafts DISABLE ROW LEVEL SECURITY;
