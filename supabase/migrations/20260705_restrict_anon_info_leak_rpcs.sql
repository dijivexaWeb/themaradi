-- get_vault_owner_id ve get_heir_vault_ids_for_user, heirs/vaults RLS politikalarında
-- authenticated rolü için kullanılıyor — o yüzden authenticated'dan kaldırmıyoruz, sadece
-- anon'un doğrudan /rest/v1/rpc/ üzerinden çağırıp sahiplik/varis bilgisi sızdırmasını engelliyoruz.
--
-- ÖNEMLİ: Postgres'te fonksiyonlar varsayılan olarak PUBLIC pseudo-role'üne EXECUTE
-- yetkisi verilerek oluşturulur. Sadece belirli bir role'den (anon/authenticated) REVOKE
-- etmek yetmez — PUBLIC üzerinden hâlâ devralınır. Önce PUBLIC'ten kaldırıp, ihtiyacı olan
-- role'e (authenticated) tekrar veriyoruz.
REVOKE EXECUTE ON FUNCTION public.get_vault_owner_id(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_heir_vault_ids_for_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_vault_owner_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_heir_vault_ids_for_user(uuid) TO authenticated;

-- get_db_stats yalnızca admin panelinde (service role client ile) kullanılıyor —
-- service role zaten grant'lardan bağımsız çalışır, bu yüzden kimseye açık kalmasın.
REVOKE EXECUTE ON FUNCTION public.get_db_stats() FROM PUBLIC;
