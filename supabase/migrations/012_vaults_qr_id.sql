-- Kalıcı QR ID — slug değişse bile QR çalışmaya devam eder
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS qr_id text UNIQUE;

UPDATE vaults
SET qr_id = 'mem-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
WHERE qr_id IS NULL;

ALTER TABLE vaults ALTER COLUMN qr_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vaults_qr_id ON vaults(qr_id);
