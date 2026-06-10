-- İtiraz tablosu: ziyaretçiler hâlâ hayatta olduğunu düşündükleri kişiler için itiraz gönderebilir
CREATE TABLE IF NOT EXISTS memorial_objections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  message text,
  consent_email boolean NOT NULL DEFAULT false,
  consent_phone boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'valid', 'dismissed')),
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  admin_note text
);

ALTER TABLE memorial_objections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit objection"
  ON memorial_objections FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage objections"
  ON memorial_objections FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_memorial_objections_vault_id ON memorial_objections(vault_id);
CREATE INDEX idx_memorial_objections_status ON memorial_objections(status);
CREATE INDEX idx_memorial_objections_created_at ON memorial_objections(created_at DESC);
