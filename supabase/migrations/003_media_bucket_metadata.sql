-- Media bucket + required timeline metadata

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault-media',
  'vault-media',
  true,
  104857600,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'url'
    CHECK (source_type IN ('url', 'bucket')),
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private'
    CHECK (visibility IN ('private', 'public'));

UPDATE public.media
SET
  source_type = COALESCE(source_type, 'url'),
  visibility = CASE WHEN is_public THEN 'public' ELSE 'private' END
WHERE source_type IS NULL OR visibility IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_source_has_location'
  ) THEN
    ALTER TABLE public.media
      ADD CONSTRAINT media_source_has_location
      CHECK (
        (source_type = 'url' AND original_url IS NOT NULL AND btrim(original_url) <> '')
        OR
        (source_type = 'bucket' AND storage_bucket IS NOT NULL AND storage_path IS NOT NULL)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_timeline_requires_metadata'
  ) THEN
    ALTER TABLE public.media
      ADD CONSTRAINT media_timeline_requires_metadata
      CHECK (
        media_type NOT IN ('image', 'video')
        OR (
          taken_at IS NOT NULL
          AND caption IS NOT NULL
          AND btrim(caption) <> ''
          AND visibility IS NOT NULL
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'vault owners upload vault media'
  ) THEN
    CREATE POLICY "vault owners upload vault media" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'vault-media'
        AND EXISTS (
          SELECT 1 FROM public.vaults
          WHERE id::text = (storage.foldername(name))[1]
            AND owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'vault owners manage vault media'
  ) THEN
    CREATE POLICY "vault owners manage vault media" ON storage.objects
      FOR ALL TO authenticated
      USING (
        bucket_id = 'vault-media'
        AND EXISTS (
          SELECT 1 FROM public.vaults
          WHERE id::text = (storage.foldername(name))[1]
            AND owner_id = auth.uid()
        )
      )
      WITH CHECK (
        bucket_id = 'vault-media'
        AND EXISTS (
          SELECT 1 FROM public.vaults
          WHERE id::text = (storage.foldername(name))[1]
            AND owner_id = auth.uid()
        )
      );
  END IF;
END $$;
