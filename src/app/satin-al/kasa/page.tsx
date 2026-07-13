import type { Metadata } from 'next'
import { fetchPricingConfig } from '@/lib/pricing'
import { resolveAmount } from '@/lib/currency'
import { getTranslation } from '@/i18n/server'
import { getBogSettings } from '@/lib/bog'
import KasaFormClient from './_KasaFormClient'

export const metadata: Metadata = {
  title: 'Yaşam Kasası Satın Al',
  robots: { index: false, follow: true },
}

export default async function KasaSatinAlPage() {
  const { lang } = await getTranslation()
  const [pricing, bogSettings] = await Promise.all([fetchPricingConfig(), getBogSettings()])

  const setup = resolveAmount(lang, {
    campaignActive: pricing.campaignActive,
    try_: pricing.vaultSetupTry, gel: pricing.vaultSetup, usd: pricing.vaultSetupUsd, rub: pricing.vaultSetupRub,
    campaignGel: pricing.campaignVaultSetup,
    fallbackGel: Number(pricing.vaultSetup),
  })
  const monthly = resolveAmount(lang, {
    campaignActive: pricing.campaignActive,
    try_: pricing.vaultMonthlyTry, gel: pricing.vaultMonthly, usd: pricing.vaultMonthlyUsd, rub: pricing.vaultMonthlyRub,
    campaignGel: pricing.campaignVaultMonthly,
    fallbackGel: Number(pricing.vaultMonthly),
  })

  return <KasaFormClient setupAmount={setup.amount} monthlyAmount={monthly.amount} currency={setup.currency} cardPaymentAvailable={bogSettings.enabled} />
}
