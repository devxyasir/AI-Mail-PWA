-- FINAL CONSOLIDATED SCHEMA SYNC FOR SUPABASE
-- Run this in the Supabase SQL Editor to ensure your database matches the Antigravity Core logic.

-- 1. Ensure user_id is TEXT (for NextAuth compatibility)
ALTER TABLE public.email_accounts ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.ai_metadata ALTER COLUMN user_id TYPE TEXT;

-- 2. Add Unique Constraint to email_accounts for Upsert/Login support
-- If this fails, you may have duplicate (user_id, email) rows that need manual deletion.
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'email_accounts_user_id_email_key'
    ) THEN
        ALTER TABLE public.email_accounts ADD CONSTRAINT email_accounts_user_id_email_key UNIQUE (user_id, email);
    END IF;
END $$;

-- 3. Expand check constraints for AI Features and Labels
-- Update ai_metadata feature list
ALTER TABLE public.ai_metadata DROP CONSTRAINT IF EXISTS ai_metadata_feature_check;
ALTER TABLE public.ai_metadata ADD CONSTRAINT ai_metadata_feature_check 
CHECK (feature IN ('summarise', 'reply-draft', 'priority', 'priority-batch', 'chat'));

-- Update email_ai_data priority_label list
ALTER TABLE public.email_ai_data DROP CONSTRAINT IF EXISTS email_ai_data_priority_label_check;
ALTER TABLE public.email_ai_data ADD CONSTRAINT email_ai_data_priority_label_check 
CHECK (priority_label IN ('low', 'medium', 'high', 'urgent', 'direct', 'digest', 'receipt', 'social'));

-- 4. Consolidate Vector Embeddings (384-dim for Transformers.js / Hugging Face)
-- We DROP the old 1536 table if it exists to ensure correct dimensions
DROP TABLE IF EXISTS public.email_embeddings;

CREATE TABLE public.email_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  provider_message_id TEXT NOT NULL,
  embedding VECTOR(384), -- Dimension for BAAI/bge-small-en-v1.5
  content TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, provider_message_id)
);

CREATE INDEX idx_email_embeddings_vector ON public.email_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 5. Recreate RAG Match Engine (384-dim)
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

-- 6. Ensure Drafts table is fully implemented
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

-- 7. Bypass RLS for Server-Side Orchestration
ALTER TABLE public.email_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ai_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts DISABLE ROW LEVEL SECURITY;
