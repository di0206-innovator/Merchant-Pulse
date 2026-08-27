-- ====================================================================
-- MerchantPulse AI Knowledge Base (Multimodal RAG) Schema
-- ====================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Storage Bucket for Knowledge Base Files (PDFs, Audio)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'knowledge_base',
  'knowledge_base',
  false,
  20971520, -- 20MB limit
  '{"application/pdf", "audio/mpeg", "audio/wav", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}'
) ON CONFLICT (id) DO NOTHING;

-- 3. Documents Table (Tracks uploaded files and processing state)
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id VARCHAR(64) NOT NULL DEFAULT 'rzp_merchant_main',
    filename TEXT NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'UPLOADED', -- UPLOADED | PROCESSING | READY | ERROR
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_merchant ON public.knowledge_documents(merchant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON public.knowledge_documents(status);

-- 4. Chunks Table (Stores the extracted semantic blocks + Vector Embeddings)
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- HNSW Index for fast vector similarity search using L2 distance (or cosine)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON public.knowledge_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc_id ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_merchant_id ON public.knowledge_chunks(merchant_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Tables
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY merchant_select_documents ON public.knowledge_documents
    FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY merchant_insert_documents ON public.knowledge_documents
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY merchant_update_documents ON public.knowledge_documents
    FOR UPDATE TO authenticated USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY merchant_delete_documents ON public.knowledge_documents
    FOR DELETE TO authenticated USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY merchant_select_chunks ON public.knowledge_chunks
    FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- Storage (Supabase uses storage.objects table for RLS on files)
CREATE POLICY merchant_upload_files ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'knowledge_base' AND (select auth.uid()) IS NOT NULL
    );

CREATE POLICY merchant_read_files ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'knowledge_base' AND (select auth.uid()) IS NOT NULL
    );

CREATE POLICY merchant_delete_files ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'knowledge_base' AND (select auth.uid()) IS NOT NULL
    );

-- Search Function (RAG similarity matching)
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
    query_embedding vector(768),
    match_merchant_id varchar(64),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kc.id,
        kc.document_id,
        kc.content,
        1 - (kc.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_chunks kc
    WHERE kc.merchant_id = match_merchant_id
      AND 1 - (kc.embedding <=> query_embedding) > match_threshold
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
