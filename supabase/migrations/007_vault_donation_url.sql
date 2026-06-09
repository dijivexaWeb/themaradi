ALTER TABLE public.vaults
  ADD COLUMN IF NOT EXISTS donation_url TEXT;
