export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          id: string
          ip_hash: string | null
          new_value: Json | null
          old_value: Json | null
          vault_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          new_value?: Json | null
          old_value?: Json | null
          vault_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          new_value?: Json | null
          old_value?: Json | null
          vault_id?: string | null
        }
      }
      death_claims: {
        Row: {
          ai_pre_check_result: Json | null
          claimant_id: string
          created_at: string | null
          document_type: string | null
          document_url: string | null
          id: string
          objection_deadline: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          vault_id: string
        }
        Insert: {
          ai_pre_check_result?: Json | null
          claimant_id: string
          created_at?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          objection_deadline?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          vault_id: string
        }
        Update: {
          ai_pre_check_result?: Json | null
          claimant_id?: string
          created_at?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          objection_deadline?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          vault_id?: string
        }
      }
      dynamic_qr: {
        Row: {
          activated_at: string | null
          created_at: string | null
          created_by: string | null
          is_active: boolean | null
          physical_format: string | null
          qr_hash: string
          redirect_count: number | null
          target_vault_id: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          is_active?: boolean | null
          physical_format?: string | null
          qr_hash: string
          redirect_count?: number | null
          target_vault_id?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          created_by?: string | null
          is_active?: boolean | null
          physical_format?: string | null
          qr_hash?: string
          redirect_count?: number | null
          target_vault_id?: string | null
        }
      }
      guestbook: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          ip_hash: string | null
          is_approved: boolean | null
          message: string
          rejected_reason: string | null
          vault_id: string
          visitor_email: string | null
          visitor_name: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          is_approved?: boolean | null
          message: string
          rejected_reason?: string | null
          vault_id: string
          visitor_email?: string | null
          visitor_name: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          is_approved?: boolean | null
          message?: string
          rejected_reason?: string | null
          vault_id?: string
          visitor_email?: string | null
          visitor_name?: string
        }
      }
      heirs: {
        Row: {
          accepted_at: string | null
          access_level: string | null
          created_at: string | null
          heir_email: string
          heir_profile_id: string | null
          id: string
          invitation_expires_at: string | null
          invitation_token: string | null
          shamir_key_share: string | null
          status: string | null
          vault_id: string
        }
        Insert: {
          accepted_at?: string | null
          access_level?: string | null
          created_at?: string | null
          heir_email: string
          heir_profile_id?: string | null
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          shamir_key_share?: string | null
          status?: string | null
          vault_id: string
        }
        Update: {
          accepted_at?: string | null
          access_level?: string | null
          created_at?: string | null
          heir_email?: string
          heir_profile_id?: string | null
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          shamir_key_share?: string | null
          status?: string | null
          vault_id?: string
        }
      }
      media: {
        Row: {
          ai_tags: string[] | null
          caption: string | null
          created_at: string | null
          file_size_bytes: number | null
          id: string
          is_public: boolean | null
          large_url: string | null
          media_type: string | null
          medium_url: string | null
          original_filename: string | null
          original_url: string
          sort_order: number | null
          source_type: string | null
          storage_bucket: string | null
          storage_path: string | null
          taken_at: string | null
          thumb_url: string | null
          uploader_id: string | null
          vault_id: string
          visibility: string | null
        }
        Insert: {
          ai_tags?: string[] | null
          caption?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          large_url?: string | null
          media_type?: string | null
          medium_url?: string | null
          original_filename?: string | null
          original_url: string
          sort_order?: number | null
          source_type?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          taken_at?: string | null
          thumb_url?: string | null
          uploader_id?: string | null
          vault_id: string
          visibility?: string | null
        }
        Update: {
          ai_tags?: string[] | null
          caption?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          large_url?: string | null
          media_type?: string | null
          medium_url?: string | null
          original_filename?: string | null
          original_url?: string
          sort_order?: number | null
          source_type?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          taken_at?: string | null
          thumb_url?: string | null
          uploader_id?: string | null
          vault_id?: string
          visibility?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          locale: string | null
          notification_email: boolean | null
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          locale?: string | null
          notification_email?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          locale?: string | null
          notification_email?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
      }
      qr_analytics: {
        Row: {
          city: string | null
          country_code: string | null
          device_type: string | null
          id: string
          qr_hash: string | null
          scanned_at: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          device_type?: string | null
          id?: string
          qr_hash?: string | null
          scanned_at?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string | null
          device_type?: string | null
          id?: string
          qr_hash?: string | null
          scanned_at?: string | null
          user_agent?: string | null
        }
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          storage_limit_bytes: number | null
          storage_used_bytes: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          storage_limit_bytes?: number | null
          storage_used_bytes?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          storage_limit_bytes?: number | null
          storage_used_bytes?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          user_id?: string
        }
      }
      vaults: {
        Row: {
          biography: string | null
          birth_date: string | null
          cover_photo_url: string | null
          created_at: string | null
          data_protection_flag: boolean | null
          death_date: string | null
          display_name: string
          encryption_enabled: boolean | null
          id: string
          owner_id: string
          profession: string | null
          hobbies: string | null
          favorite_song_title: string | null
          favorite_song_url: string | null
          donation_preference: string | null
          slug: string | null
          status: string | null
          transition_date: string | null
          updated_at: string | null
        }
        Insert: {
          biography?: string | null
          birth_date?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          data_protection_flag?: boolean | null
          death_date?: string | null
          display_name: string
          encryption_enabled?: boolean | null
          id?: string
          owner_id: string
          profession?: string | null
          hobbies?: string | null
          favorite_song_title?: string | null
          favorite_song_url?: string | null
          donation_preference?: string | null
          slug?: string | null
          status?: string | null
          transition_date?: string | null
          updated_at?: string | null
        }
        Update: {
          biography?: string | null
          birth_date?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          data_protection_flag?: boolean | null
          death_date?: string | null
          display_name?: string
          encryption_enabled?: boolean | null
          id?: string
          owner_id?: string
          profession?: string | null
          hobbies?: string | null
          favorite_song_title?: string | null
          favorite_song_url?: string | null
          donation_preference?: string | null
          slug?: string | null
          status?: string | null
          transition_date?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Vault = Tables<'vaults'>
export type Heir = Tables<'heirs'>
export type Media = Tables<'media'>
export type Guestbook = Tables<'guestbook'>
export type DynamicQR = Tables<'dynamic_qr'>
export type DeathClaim = Tables<'death_claims'>
export type Subscription = Tables<'subscriptions'>
