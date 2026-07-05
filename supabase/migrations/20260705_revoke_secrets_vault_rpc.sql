-- secrets_vault mekanizması (vault_get/vault_upsert/vault_encrypt/vault_decrypt) hiçbir
-- app kodu veya trigger tarafından kullanılmıyor (grep + prosrc taraması ile doğrulandı) ve
-- sahiplik/yetki kontrolü olmadan anon+authenticated rollerine açıktı. Kullanılmadığı için
-- fonksiyonları silmek yerine EXECUTE yetkisini kaldırıyoruz (geriye dönük uyumlu, güvenli).
REVOKE EXECUTE ON FUNCTION public.vault_get(character varying, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.vault_upsert(character varying, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.vault_encrypt(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.vault_decrypt(text) FROM PUBLIC, anon, authenticated;
