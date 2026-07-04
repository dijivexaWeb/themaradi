ALTER TABLE vaults ADD COLUMN IF NOT EXISTS onboarding_step INT NOT NULL DEFAULT 1;
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Mevcut (bu ozellikten once olusturulmus) tum vault'lar zaten kurulumlarini
-- yapmis sayilir - onboarding wizard'ina zorlanmasinlar.
UPDATE vaults SET onboarding_completed_at = created_at WHERE onboarding_completed_at IS NULL;
