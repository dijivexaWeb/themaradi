ALTER TABLE vaults
  ADD COLUMN IF NOT EXISTS birth_date_precision TEXT DEFAULT 'day',
  ADD COLUMN IF NOT EXISTS death_date_precision TEXT DEFAULT 'day';

ALTER TABLE vault_family_members
  ADD COLUMN IF NOT EXISTS birth_date_precision TEXT DEFAULT 'day',
  ADD COLUMN IF NOT EXISTS death_date_precision TEXT DEFAULT 'day';
