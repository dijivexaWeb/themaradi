import type { PricingConfig } from '@/lib/pricing'
import type { Lang } from '@/i18n'

export type CurrencyCode = 'TRY' | 'RUB' | 'GEL' | 'USD'

// Tek doğruluk kaynağı: dil → para birimi. DB'de sadece 3 dil için ayrı fiyat
// yapısı var: tr → TRY, ru → RUB, ka → GEL (varsayılan/temel para birimi).
// Diğer tüm diller (en/az/hy/he) → USD.
export const LANG_CURRENCY: Record<Lang, { code: CurrencyCode; symbol: string }> = {
  tr: { code: 'TRY', symbol: '₺' },
  ru: { code: 'RUB', symbol: '₽' },
  ka: { code: 'GEL', symbol: '₾' },
  az: { code: 'USD', symbol: '$' },
  hy: { code: 'USD', symbol: '$' },
  en: { code: 'USD', symbol: '$' },
  he: { code: 'USD', symbol: '$' },
}

export function getCurrencyForLang(lang: string): { code: CurrencyCode; symbol: string } {
  return LANG_CURRENCY[lang as Lang] || LANG_CURRENCY.ka
}

export type CurrencyView = {
  symbol: string; memorial: string; vaultSetup: string
  vaultMonthly: string; campaignMemorial: string; campaignVaultMonthly: string
  family: string; campaignFamily: string
  renewalPrice: string; renewalSymbol: string
}

// Yenileme (hosting renewal) fiyatı DB'de sadece GEL/TRY/USD olarak tutulur —
// RUB yenileme fiyatı yok, bu yüzden ru için de USD yenileme kullanılır.
export function getRenewal(pricing: PricingConfig, lang: string): { renewalPrice: string; renewalSymbol: string } {
  const { code } = getCurrencyForLang(lang)
  if (code === 'TRY') return { renewalPrice: pricing.hostingRenewalTry, renewalSymbol: '₺' }
  if (code === 'GEL') return { renewalPrice: pricing.hostingRenewalGel, renewalSymbol: '₾' }
  return { renewalPrice: pricing.hostingRenewalUsd, renewalSymbol: '$' }
}

export function buildCurrencyView(pricing: PricingConfig, lang: string): CurrencyView {
  const renewal = getRenewal(pricing, lang)
  const { code, symbol } = getCurrencyForLang(lang)

  if (code === 'TRY' && pricing.memorialTry) {
    return {
      symbol, memorial: pricing.memorialTry,
      vaultSetup: pricing.vaultSetupTry || pricing.vaultSetup,
      vaultMonthly: pricing.vaultMonthlyTry || pricing.vaultMonthly,
      campaignMemorial: pricing.campaignMemorialTry, campaignVaultMonthly: pricing.campaignVaultMonthlyTry,
      family: pricing.familyTry || pricing.familyGel, campaignFamily: pricing.campaignFamilyTry,
      ...renewal,
    }
  }
  if (code === 'RUB' && pricing.memorialRub) {
    return {
      symbol, memorial: pricing.memorialRub,
      vaultSetup: pricing.vaultSetupRub || pricing.vaultSetup,
      vaultMonthly: pricing.vaultMonthlyRub || pricing.vaultMonthly,
      campaignMemorial: pricing.campaignMemorialRub, campaignVaultMonthly: pricing.campaignVaultMonthlyRub,
      family: pricing.familyRub || pricing.familyGel, campaignFamily: pricing.campaignFamilyRub,
      ...renewal,
    }
  }
  if (code === 'USD' && pricing.memorialUsd) {
    return {
      symbol, memorial: pricing.memorialUsd,
      vaultSetup: pricing.vaultSetupUsd || pricing.vaultSetup,
      vaultMonthly: pricing.vaultMonthlyUsd || pricing.vaultMonthly,
      campaignMemorial: pricing.campaignMemorialUsd, campaignVaultMonthly: pricing.campaignVaultMonthlyUsd,
      family: pricing.familyUsd || pricing.familyGel, campaignFamily: pricing.campaignFamilyUsd,
      ...renewal,
    }
  }
  return {
    symbol, memorial: pricing.memorialPrice, vaultSetup: pricing.vaultSetup, vaultMonthly: pricing.vaultMonthly,
    campaignMemorial: pricing.campaignMemorial, campaignVaultMonthly: pricing.campaignVaultMonthly,
    family: pricing.familyGel, campaignFamily: pricing.campaignFamilyGel,
    ...renewal,
  }
}

// satin-al sayfaları için: tek ürün fiyatı (kampanya dahil) döndürür.
export function resolveAmount(lang: string, opts: {
  campaignActive: boolean
  try_?: string; gel: string; usd: string; rub?: string
  campaignTry?: string; campaignGel?: string; campaignUsd?: string; campaignRub?: string
  fallbackGel: number
}): { amount: number; currency: string } {
  const { code, symbol } = getCurrencyForLang(lang)
  if (code === 'TRY') {
    const amount = opts.campaignActive && opts.campaignTry ? Number(opts.campaignTry) : Number(opts.try_ || opts.fallbackGel)
    return { amount, currency: symbol }
  }
  if (code === 'RUB') {
    const amount = opts.campaignActive && opts.campaignRub ? Number(opts.campaignRub) : Number(opts.rub || opts.fallbackGel)
    return { amount, currency: symbol }
  }
  if (code === 'GEL') {
    const amount = opts.campaignActive && opts.campaignGel ? Number(opts.campaignGel) : Number(opts.gel || opts.fallbackGel)
    return { amount, currency: symbol }
  }
  const amount = opts.campaignActive && opts.campaignUsd ? Number(opts.campaignUsd) : Number(opts.usd || opts.fallbackGel)
  return { amount, currency: symbol }
}
