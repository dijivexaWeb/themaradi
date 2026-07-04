ALTER TABLE user_consents ADD COLUMN IF NOT EXISTS consent_language TEXT;
ALTER TABLE user_consents ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE user_consents ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE user_consents ADD COLUMN IF NOT EXISTS marketing_permission BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_consents ADD COLUMN IF NOT EXISTS privacy_notice_ack BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_consents ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE user_consents DROP CONSTRAINT IF EXISTS user_consents_consent_language_check;
ALTER TABLE user_consents ADD CONSTRAINT user_consents_consent_language_check
  CHECK (consent_language IS NULL OR consent_language IN ('tr','ka','ru','en','az','hy','he'));

COMMENT ON COLUMN user_consents.email_consent IS 'DEPRECATED - v2 akista data_processing_consent kullan';
COMMENT ON COLUMN user_consents.phone_consent IS 'DEPRECATED - v2 akista data_processing_consent kullan';
