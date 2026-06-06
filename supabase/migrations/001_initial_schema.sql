-- =============================================
-- themaradi — Initial Schema Migration
-- =============================================

-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  locale VARCHAR(10) DEFAULT 'tr',
  notification_email BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier VARCHAR(50) CHECK (tier IN ('yearly', 'lifetime')) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
  stripe_subscription_id VARCHAR(200) UNIQUE,
  stripe_customer_id VARCHAR(200),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  storage_limit_bytes BIGINT DEFAULT 53687091200, -- 50GB
  storage_used_bytes BIGINT DEFAULT 0,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "service_manages_subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true);

-- 3. VAULTS
CREATE TABLE public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'hidden_vault'
    CHECK (status IN ('hidden_vault', 'private_memorial', 'public_memorial')),
  biography TEXT,
  cover_photo_url TEXT,
  birth_date DATE,
  death_date DATE,
  transition_date TIMESTAMPTZ,
  data_protection_flag BOOLEAN DEFAULT false,
  encryption_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_manages_vault" ON public.vaults
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "public_memorial_visible_to_all" ON public.vaults
  FOR SELECT TO anon, authenticated USING (status = 'public_memorial');

-- 4. HEIRS
CREATE TABLE public.heirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  heir_email VARCHAR(255) NOT NULL,
  heir_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  access_level VARCHAR(50) DEFAULT 'viewer'
    CHECK (access_level IN ('executor', 'contributor', 'viewer')),
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'revoked')),
  invitation_token VARCHAR(100) UNIQUE,
  invitation_expires_at TIMESTAMPTZ,
  shamir_key_share TEXT,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.heirs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vault_owner_manages_heirs" ON public.heirs
  FOR ALL TO authenticated
  USING (auth.uid() = (SELECT owner_id FROM public.vaults WHERE id = vault_id));
CREATE POLICY "active_heirs_can_view_vault" ON public.vaults
  FOR SELECT TO authenticated
  USING (
    auth.uid() IN (
      SELECT heir_profile_id FROM public.heirs
      WHERE vault_id = vaults.id AND status = 'active'
    )
  );

-- 5. MEDIA
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES public.profiles(id),
  original_url TEXT NOT NULL,
  thumb_url TEXT,
  medium_url TEXT,
  large_url TEXT,
  media_type VARCHAR(50) CHECK (media_type IN ('image','video','audio','document')),
  original_filename VARCHAR(500),
  file_size_bytes BIGINT,
  is_public BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  ai_tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vault_owner_manages_media" ON public.media
  FOR ALL TO authenticated
  USING (auth.uid() = (SELECT owner_id FROM public.vaults WHERE id = vault_id));
CREATE POLICY "public_media_visible_to_anon" ON public.media
  FOR SELECT TO anon, authenticated
  USING (
    is_public = true AND
    vault_id IN (SELECT id FROM public.vaults WHERE status = 'public_memorial')
  );

-- 6. GUESTBOOK
CREATE TABLE public.guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  rejected_reason TEXT,
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id)
);
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_can_insert_guestbook" ON public.guestbook
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "vault_owner_manages_guestbook" ON public.guestbook
  FOR ALL TO authenticated
  USING (auth.uid() = (SELECT owner_id FROM public.vaults WHERE id = vault_id));
CREATE POLICY "approved_messages_visible" ON public.guestbook
  FOR SELECT TO anon, authenticated USING (is_approved = true);

-- 7. DYNAMIC QR
CREATE TABLE public.dynamic_qr (
  qr_hash VARCHAR(50) PRIMARY KEY,
  target_vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  redirect_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  physical_format VARCHAR(50)
);
ALTER TABLE public.dynamic_qr ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_can_read_active_qr" ON public.dynamic_qr
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "creator_manages_qr" ON public.dynamic_qr
  FOR ALL TO authenticated USING (auth.uid() = created_by);

-- 8. QR ANALYTICS
CREATE TABLE public.qr_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_hash VARCHAR(50) REFERENCES public.dynamic_qr(qr_hash),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  device_type VARCHAR(50),
  country_code VARCHAR(5),
  city VARCHAR(100)
);
ALTER TABLE public.qr_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_manages_analytics" ON public.qr_analytics
  FOR ALL TO service_role USING (true);

-- 9. DEATH CLAIMS
CREATE TABLE public.death_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id),
  claimant_id UUID NOT NULL REFERENCES public.profiles(id),
  document_url TEXT,
  document_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'contested')),
  ai_pre_check_result JSONB,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  objection_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.death_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "claimant_can_insert" ON public.death_claims
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = claimant_id);
CREATE POLICY "claimant_can_view_own" ON public.death_claims
  FOR SELECT TO authenticated USING (auth.uid() = claimant_id);
CREATE POLICY "service_manages_claims" ON public.death_claims
  FOR ALL TO service_role USING (true);

-- 10. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES public.vaults(id),
  actor_id UUID REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_manages_audit" ON public.audit_logs
  FOR ALL TO service_role USING (true);
CREATE POLICY "vault_owner_reads_audit" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = (SELECT owner_id FROM public.vaults WHERE id = vault_id));

-- =============================================
-- TRIGGERS
-- =============================================

-- Yeni kullanıcı kaydında profil otomatik oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Kasa durumu değişince otomatik işlemler
CREATE OR REPLACE FUNCTION handle_vault_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'hidden_vault' AND NEW.status = 'public_memorial' THEN
    NEW.transition_date := NOW();
    NEW.data_protection_flag := true;
    INSERT INTO public.audit_logs (vault_id, action, old_value, new_value)
    VALUES (
      NEW.id,
      'vault_transition',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'transition_date', NOW())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vault_status_change
  BEFORE UPDATE ON public.vaults
  FOR EACH ROW EXECUTE FUNCTION handle_vault_transition();

-- updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_vaults_updated_at
  BEFORE UPDATE ON public.vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
