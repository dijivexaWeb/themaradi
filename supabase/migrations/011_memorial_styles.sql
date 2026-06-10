-- Memorial style + action buttons system
CREATE TABLE IF NOT EXISTS memorial_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  selected_template_key text NOT NULL DEFAULT 'universal',
  custom_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(memorial_id)
);

CREATE TABLE IF NOT EXISTS memorial_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  label text NOT NULL,
  icon text NOT NULL DEFAULT 'heart',
  is_active boolean NOT NULL DEFAULT true,
  show_counter boolean NOT NULL DEFAULT true,
  count integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memorial_action_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id uuid NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES memorial_actions(id) ON DELETE CASCADE,
  visitor_hash text,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE memorial_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_action_clicks ENABLE ROW LEVEL SECURITY;

-- memorial_styles
CREATE POLICY "Owner manages memorial style"
  ON memorial_styles FOR ALL TO authenticated
  USING (memorial_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid()))
  WITH CHECK (memorial_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid()));

CREATE POLICY "Public reads memorial style"
  ON memorial_styles FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages memorial styles"
  ON memorial_styles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- memorial_actions
CREATE POLICY "Owner manages memorial actions"
  ON memorial_actions FOR ALL TO authenticated
  USING (memorial_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid()))
  WITH CHECK (memorial_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid()));

CREATE POLICY "Public reads memorial actions"
  ON memorial_actions FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages memorial actions"
  ON memorial_actions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- memorial_action_clicks
CREATE POLICY "Anyone can record click"
  ON memorial_action_clicks FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Owner reads action clicks"
  ON memorial_action_clicks FOR SELECT TO authenticated
  USING (memorial_id IN (SELECT id FROM vaults WHERE owner_id = auth.uid()));

CREATE POLICY "Service role manages action clicks"
  ON memorial_action_clicks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_memorial_styles_memorial_id ON memorial_styles(memorial_id);
CREATE INDEX idx_memorial_actions_memorial_id ON memorial_actions(memorial_id);
CREATE INDEX idx_memorial_actions_sort_order ON memorial_actions(memorial_id, sort_order);
CREATE INDEX idx_memorial_action_clicks_action_id ON memorial_action_clicks(action_id);
CREATE INDEX idx_memorial_action_clicks_visitor ON memorial_action_clicks(action_id, visitor_hash);
CREATE INDEX idx_memorial_action_clicks_created_at ON memorial_action_clicks(created_at DESC);
