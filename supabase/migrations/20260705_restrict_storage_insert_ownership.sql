-- "media" ve "vault-media" Supabase Storage bucket'larındaki INSERT (upload) politikaları
-- hiçbir kısıtlama içermiyordu (qual = null) — giriş yapmış HERHANGİ bir kullanıcı, bu
-- bucket'lardaki HERHANGİ bir path'e dosya yükleyebiliyordu (IDOR / storage kirletme riski).
-- Zaten var olan DELETE politikaları path'teki kullanıcı segmentini kontrol ediyor
-- (vault-media: {vaultId}/{userId}/..., media: {userId}/...) — INSERT'i de aynı desenle
-- kısıtlıyoruz. Mevcut 43 dosyanın okunabilirliği (SELECT policy'leri) değişmiyor.

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Authenticated users can upload to vault-media" ON storage.objects;
CREATE POLICY "Authenticated users can upload to vault-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vault-media'
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );
