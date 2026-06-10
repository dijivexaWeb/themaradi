-- =============================================
-- 013 — Cloudflare R2 & Cloudflare Stream Schema Updates
-- =============================================

-- 1. media tablosuna video işleme ve R2 kolonları ekle
ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ready'
    CHECK (status IN ('pending_upload', 'processing', 'ready', 'failed', 'deleted')),
  ADD COLUMN IF NOT EXISTS r2_file_key TEXT,
  ADD COLUMN IF NOT EXISTS cf_stream_id TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. memorial_verification_docs tablosuna file_key ekle (vefat belgeleri vb.)
ALTER TABLE public.memorial_verification_docs
  ADD COLUMN IF NOT EXISTS file_key TEXT;

-- 3. vault_documents tablosuna file_key ekle (kasa/vasiyet belgeleri vb.)
ALTER TABLE public.vault_documents
  ADD COLUMN IF NOT EXISTS file_key TEXT;

-- 4. vault_audio_recordings tablosuna R2 ve storage kolonları ekle (ses kayıtları)
ALTER TABLE public.vault_audio_recordings
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS r2_file_key TEXT;
