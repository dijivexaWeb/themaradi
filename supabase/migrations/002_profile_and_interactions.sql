-- =============================================
-- 002 — Profile & Interactions Schema
-- =============================================

-- 1. VAULTS genişletme
ALTER TABLE public.vaults
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS death_place TEXT,
  ADD COLUMN IF NOT EXISTS last_message TEXT,
  ADD COLUMN IF NOT EXISTS cemetery_name TEXT,
  ADD COLUMN IF NOT EXISTS cemetery_address TEXT,
  ADD COLUMN IF NOT EXISTS cemetery_lat DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS cemetery_lng DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS vault_origin VARCHAR(20) DEFAULT 'self'
    CHECK (vault_origin IN ('self', 'family'));

-- 2. HEIRS — vefat onay alanı
ALTER TABLE public.heirs
  ADD COLUMN IF NOT EXISTS death_confirmed_at TIMESTAMPTZ;

-- 3. GUESTBOOK — etkileşim tipi
ALTER TABLE public.guestbook
  ADD COLUMN IF NOT EXISTS interaction_type VARCHAR(30) DEFAULT 'message'
    CHECK (interaction_type IN ('message', 'candle', 'flower', 'prayer'));

-- 4. NOTIFICATIONS tablosu
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vault_id UUID REFERENCES public.vaults(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('candle', 'flower', 'message', 'prayer', 'death_confirmed', 'heir_invited', 'heir_accepted')),
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipient_reads_own_notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "service_manages_notifications" ON public.notifications
  FOR ALL TO service_role USING (true);

-- 5. TRIGGER — 2/3 varis onayı → vault public_memorial'a geç
CREATE OR REPLACE FUNCTION public.check_heir_confirmations()
RETURNS TRIGGER AS $$
DECLARE
  confirmed_count INT;
BEGIN
  SELECT COUNT(*) INTO confirmed_count
  FROM public.heirs
  WHERE vault_id = NEW.vault_id
    AND death_confirmed_at IS NOT NULL
    AND status = 'active';

  IF confirmed_count >= 2 THEN
    UPDATE public.vaults
    SET status = 'public_memorial'
    WHERE id = NEW.vault_id
      AND status != 'public_memorial';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_heir_death_confirmation ON public.heirs;
CREATE TRIGGER on_heir_death_confirmation
  AFTER UPDATE OF death_confirmed_at ON public.heirs
  FOR EACH ROW
  WHEN (NEW.death_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.check_heir_confirmations();
