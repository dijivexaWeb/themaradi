-- Vefat belgesi yükleme tablosu
CREATE TABLE IF NOT EXISTS memorial_verification_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'vault-media',
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT status_values CHECK (status IN ('pending','approved','rejected'))
);

ALTER TABLE memorial_verification_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_mvd" ON memorial_verification_docs FOR SELECT USING (
  vault_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid())
);
CREATE POLICY "owner_insert_mvd" ON memorial_verification_docs FOR INSERT WITH CHECK (
  vault_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid())
  AND uploader_id = auth.uid()
);
CREATE POLICY "owner_delete_mvd" ON memorial_verification_docs FOR DELETE USING (
  vault_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid())
);

-- Şahit tablosu
CREATE TABLE IF NOT EXISTS memorial_witnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vault_id, email),
  CONSTRAINT witness_status_values CHECK (status IN ('pending','confirmed'))
);

ALTER TABLE memorial_witnesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_mw" ON memorial_witnesses FOR SELECT USING (
  vault_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid())
);
CREATE POLICY "owner_insert_mw" ON memorial_witnesses FOR INSERT WITH CHECK (
  vault_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid())
);
CREATE POLICY "owner_delete_mw" ON memorial_witnesses FOR DELETE USING (
  vault_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid())
);
CREATE POLICY "witness_confirm_mw" ON memorial_witnesses FOR UPDATE USING (true) WITH CHECK (true);
