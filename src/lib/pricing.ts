import { createServiceClient } from '@/lib/supabase/server'

export type PricingConfig = {
  // GEL (₾) — base currency
  memorialPrice: string
  vaultSetup: string
  vaultMonthly: string
  // TRY (₺)
  memorialTry: string
  vaultSetupTry: string
  vaultMonthlyTry: string
  // USD ($)
  memorialUsd: string
  vaultSetupUsd: string
  vaultMonthlyUsd: string
  // RUB (₽)
  memorialRub: string
  vaultSetupRub: string
  vaultMonthlyRub: string
  // Family — GEL
  familyGel: string
  familyTry: string
  familyUsd: string
  familyRub: string
  // Additional member (sonradan eklenen üye indirimi)
  additionalMemberGel: string
  campaignAdditionalMemberGel: string
  // Campaign
  campaignActive: boolean
  campaignLabel: string
  campaignMemorial: string
  campaignVaultSetup: string
  campaignVaultMonthly: string
  campaignMemorialTry: string
  campaignVaultMonthlyTry: string
  campaignMemorialUsd: string
  campaignVaultMonthlyUsd: string
  campaignMemorialRub: string
  campaignVaultMonthlyRub: string
  campaignFamilyGel: string
  campaignFamilyTry: string
  campaignFamilyUsd: string
  campaignFamilyRub: string
  campaignEndsAt: string
}

const DEFAULTS: PricingConfig = {
  memorialPrice: '299',
  vaultSetup: '49',
  vaultMonthly: '12.90',
  memorialTry: '',
  vaultSetupTry: '',
  vaultMonthlyTry: '',
  memorialUsd: '',
  vaultSetupUsd: '',
  vaultMonthlyUsd: '',
  memorialRub: '',
  vaultSetupRub: '',
  vaultMonthlyRub: '',
  familyGel: '399',
  familyTry: '',
  familyUsd: '',
  familyRub: '',
  additionalMemberGel: '129',
  campaignAdditionalMemberGel: '',
  campaignActive: false,
  campaignLabel: '',
  campaignMemorial: '',
  campaignVaultSetup: '',
  campaignVaultMonthly: '',
  campaignMemorialTry: '',
  campaignVaultMonthlyTry: '',
  campaignMemorialUsd: '',
  campaignVaultMonthlyUsd: '',
  campaignMemorialRub: '',
  campaignVaultMonthlyRub: '',
  campaignFamilyGel: '',
  campaignFamilyTry: '',
  campaignFamilyUsd: '',
  campaignFamilyRub: '',
  campaignEndsAt: '',
}

export async function fetchPricingConfig(): Promise<PricingConfig> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [
        'price_memorial_one_time', 'price_vault_setup', 'price_vault_monthly',
        'price_memorial_try', 'price_vault_setup_try', 'price_vault_monthly_try',
        'price_memorial_usd', 'price_vault_setup_usd', 'price_vault_monthly_usd',
        'price_memorial_rub', 'price_vault_setup_rub', 'price_vault_monthly_rub',
        'price_family_gel', 'price_family_try', 'price_family_usd', 'price_family_rub',
        'campaign_active', 'campaign_label',
        'campaign_price_memorial', 'campaign_price_vault_setup', 'campaign_price_vault_monthly',
        'campaign_price_memorial_try', 'campaign_price_vault_monthly_try',
        'campaign_price_memorial_usd', 'campaign_price_vault_monthly_usd',
        'campaign_price_memorial_rub', 'campaign_price_vault_monthly_rub',
        'campaign_price_family_gel', 'campaign_price_family_try',
        'campaign_price_family_usd', 'campaign_price_family_rub',
        'price_additional_member_gel', 'campaign_price_additional_member_gel',
        'campaign_ends_at',
      ])

    if (!data) return DEFAULTS

    const s = Object.fromEntries(data.map((r) => [r.key, r.value]))

    return {
      memorialPrice: s.price_memorial_one_time || DEFAULTS.memorialPrice,
      vaultSetup: s.price_vault_setup || DEFAULTS.vaultSetup,
      vaultMonthly: s.price_vault_monthly || DEFAULTS.vaultMonthly,
      memorialTry: s.price_memorial_try || '',
      vaultSetupTry: s.price_vault_setup_try || '',
      vaultMonthlyTry: s.price_vault_monthly_try || '',
      memorialUsd: s.price_memorial_usd || '',
      vaultSetupUsd: s.price_vault_setup_usd || '',
      vaultMonthlyUsd: s.price_vault_monthly_usd || '',
      memorialRub: s.price_memorial_rub || '',
      vaultSetupRub: s.price_vault_setup_rub || '',
      vaultMonthlyRub: s.price_vault_monthly_rub || '',
      familyGel: s.price_family_gel || DEFAULTS.familyGel,
      familyTry: s.price_family_try || '',
      familyUsd: s.price_family_usd || '',
      familyRub: s.price_family_rub || '',
      campaignActive: s.campaign_active === 'true',
      campaignLabel: s.campaign_label || '',
      campaignMemorial: s.campaign_price_memorial || '',
      campaignVaultSetup: s.campaign_price_vault_setup || '',
      campaignVaultMonthly: s.campaign_price_vault_monthly || '',
      campaignMemorialTry: s.campaign_price_memorial_try || '',
      campaignVaultMonthlyTry: s.campaign_price_vault_monthly_try || '',
      campaignMemorialUsd: s.campaign_price_memorial_usd || '',
      campaignVaultMonthlyUsd: s.campaign_price_vault_monthly_usd || '',
      campaignMemorialRub: s.campaign_price_memorial_rub || '',
      campaignVaultMonthlyRub: s.campaign_price_vault_monthly_rub || '',
      campaignFamilyGel: s.campaign_price_family_gel || '',
      campaignFamilyTry: s.campaign_price_family_try || '',
      campaignFamilyUsd: s.campaign_price_family_usd || '',
      campaignFamilyRub: s.campaign_price_family_rub || '',
      additionalMemberGel: s.price_additional_member_gel || DEFAULTS.additionalMemberGel,
      campaignAdditionalMemberGel: s.campaign_price_additional_member_gel || '',
      campaignEndsAt: s.campaign_ends_at || '',
    }
  } catch {
    return DEFAULTS
  }
}
