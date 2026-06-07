import { createClient } from '@/lib/supabase/server'

export type PricingConfig = {
  memorialPrice: string
  vaultSetup: string
  vaultMonthly: string
  campaignActive: boolean
  campaignLabel: string
  campaignMemorial: string
  campaignVaultSetup: string
  campaignVaultMonthly: string
  campaignEndsAt: string
}

const DEFAULTS: PricingConfig = {
  memorialPrice: '249',
  vaultSetup: '49',
  vaultMonthly: '12.90',
  campaignActive: false,
  campaignLabel: '',
  campaignMemorial: '',
  campaignVaultSetup: '',
  campaignVaultMonthly: '',
  campaignEndsAt: '',
}

export async function fetchPricingConfig(): Promise<PricingConfig> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [
        'price_memorial_one_time', 'price_vault_setup', 'price_vault_monthly',
        'campaign_active', 'campaign_label',
        'campaign_price_memorial', 'campaign_price_vault_setup', 'campaign_price_vault_monthly',
        'campaign_ends_at',
      ])

    if (!data) return DEFAULTS

    const s = Object.fromEntries(data.map((r) => [r.key, r.value]))

    return {
      memorialPrice: s.price_memorial_one_time || DEFAULTS.memorialPrice,
      vaultSetup: s.price_vault_setup || DEFAULTS.vaultSetup,
      vaultMonthly: s.price_vault_monthly || DEFAULTS.vaultMonthly,
      campaignActive: s.campaign_active === 'true',
      campaignLabel: s.campaign_label || '',
      campaignMemorial: s.campaign_price_memorial || '',
      campaignVaultSetup: s.campaign_price_vault_setup || '',
      campaignVaultMonthly: s.campaign_price_vault_monthly || '',
      campaignEndsAt: s.campaign_ends_at || '',
    }
  } catch {
    return DEFAULTS
  }
}
