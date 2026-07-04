-- Siparis kodu sequence + kolon
CREATE SEQUENCE IF NOT EXISTS order_code_seq START 1;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_code TEXT UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_locale TEXT NOT NULL DEFAULT 'tr';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS profile_for TEXT;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_locale_check;
ALTER TABLE payments ADD CONSTRAINT payments_order_locale_check
  CHECK (order_locale IN ('tr','ka','ru','en','az','hy','he'));

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_profile_for_check;
ALTER TABLE payments ADD CONSTRAINT payments_profile_for_check
  CHECK (profile_for IS NULL OR profile_for IN ('baba','anne','es','kardes','yakin','diger'));

-- order_code uretim fonksiyonu: EM-2026-0001 formati
CREATE OR REPLACE FUNCTION generate_order_code() RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
  yr TEXT;
BEGIN
  seq_val := nextval('order_code_seq');
  yr := to_char(now(), 'YYYY');
  RETURN 'EM-' || yr || '-' || lpad(seq_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_order_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_code IS NULL THEN
    NEW.order_code := generate_order_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_code ON payments;
CREATE TRIGGER trg_set_order_code BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION set_order_code();

-- Geriye donuk dolgu
UPDATE payments SET order_code = generate_order_code() WHERE order_code IS NULL;

-- Granuler status: mevcut CHECK constraint'i genislet
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN (
  'order_created',
  'pending',
  'payment_verification',
  'paid',
  'info_pending',
  'profile_preparing',
  'publish_approval',
  'published',
  'completed',
  'overdue', 'failed', 'refunded', 'cancelled'
));
