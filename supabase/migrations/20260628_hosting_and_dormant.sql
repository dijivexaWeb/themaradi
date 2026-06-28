-- ============================================================
-- Migration: Hosting Periods + Dormant Memorial Status
-- Date: 2026-06-28
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1) Önce mevcut status değerlerini gör:
--    SELECT DISTINCT status FROM public.vaults;
--    Çıkan tüm değerleri aşağıdaki listeye ekle.

-- Mevcut constraint'i düşür, kapsamlı yenisini ekle
ALTER TABLE public.vaults
  DROP CONSTRAINT IF EXISTS vaults_status_check;

ALTER TABLE public.vaults
  ADD CONSTRAINT vaults_status_check
  CHECK (status IN (
    'hidden_vault',
    'private_memorial',
    'public_memorial',
    'dormant_memorial',
    'pending_verification',
    'pending_payment',
    'active',
    'inactive',
    'suspended',
    'draft'
  ));

-- 2) hosting_periods tablosu (3 yıllık barındırma takibi)
CREATE TABLE IF NOT EXISTS public.hosting_periods (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id         UUID        NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  starts_at        DATE        NOT NULL DEFAULT CURRENT_DATE,
  expires_at       DATE        NOT NULL,
  years_covered    INTEGER     NOT NULL DEFAULT 3,
  amount_paid      NUMERIC(10,2),
  currency         VARCHAR(10),
  payment_ref      VARCHAR(255),   -- payments.id referansı
  status           VARCHAR(30) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'canceled')),
  reminder_30_sent BOOLEAN     NOT NULL DEFAULT false,
  reminder_7_sent  BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: vault başına aktif dönem sorgusu
CREATE INDEX IF NOT EXISTS idx_hosting_periods_vault
  ON public.hosting_periods(vault_id, status, expires_at);

-- 3) platform_settings: fiyatlar + kampanya + barındırma yenileme
INSERT INTO public.platform_settings (key, value) VALUES
  -- Anma Profili fiyatlandırması (3-aşamalı model)
  ('price_memorial_one_time', '299'),          -- Faz 2: Standart fiyat (1001+ kullanıcı)
  ('campaign_price_memorial', '199'),          -- Faz 1: Erken Erişim (ilk 1000 kullanıcı)
  ('campaign_active', 'true'),                 -- Erken Erişim kampanyası aktif
  ('campaign_label', 'Erken Erişim — İlk 1000 Kullanıcı'),
  -- Barındırma yenileme (Faz 3 — 3. yıldan sonra)
  ('hosting_renewal_price_gel', '29'),         -- Faz 3: 29 ₾/yıl
  ('hosting_renewal_price_usd', '9'),
  ('hosting_renewal_price_try', '350'),
  ('hosting_initial_years', '3'),
  ('hosting_grace_period_days', '30')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4) RLS: hosting_periods — sadece servis role okuyabilir
ALTER TABLE public.hosting_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on hosting_periods" ON public.hosting_periods;
CREATE POLICY "Service role full access on hosting_periods"
  ON public.hosting_periods
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Vault sahibi kendi hosting_periods'ını görebilir
DROP POLICY IF EXISTS "Owner can view own hosting_periods" ON public.hosting_periods;
CREATE POLICY "Owner can view own hosting_periods"
  ON public.hosting_periods
  FOR SELECT
  TO authenticated
  USING (
    vault_id IN (
      SELECT id FROM public.vaults WHERE owner_id = auth.uid()
    )
  );
