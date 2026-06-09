ALTER TABLE public.vaults
  ADD COLUMN IF NOT EXISTS favorite_song_title TEXT,
  ADD COLUMN IF NOT EXISTS favorite_song_url TEXT;

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/webm'
]
WHERE id = 'vault-media';
