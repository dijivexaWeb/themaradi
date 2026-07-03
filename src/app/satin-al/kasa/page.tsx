import type { Metadata } from 'next'
import { getBankSettings } from '@/lib/bank-settings'
import { fetchPricingConfig } from '@/lib/pricing'
import KasaFormClient from './_KasaFormClient'

export const metadata: Metadata = {
  title: 'Yaşam Kasası Satın Al',
  robots: { index: false, follow: true },
}

export default async function KasaSatinAlPage() {
  const [bank, pricing] = await Promise.all([getBankSettings(), fetchPricingConfig()])
  const setupAmount = pricing.campaignActive && pricing.campaignVaultSetup
    ? Number(pricing.campaignVaultSetup)
    : Number(pricing.vaultSetup)
  const monthlyAmount = pricing.campaignActive && pricing.campaignVaultMonthly
    ? Number(pricing.campaignVaultMonthly)
    : Number(pricing.vaultMonthly)

  return <KasaFormClient bank={bank} setupAmount={setupAmount} monthlyAmount={monthlyAmount} />
}
