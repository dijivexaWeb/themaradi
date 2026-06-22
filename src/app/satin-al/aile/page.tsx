import { getBankSettings } from '@/lib/bank-settings'
import { fetchPricingConfig } from '@/lib/pricing'
import AileFormClient from './_AileFormClient'

export default async function AileSatinAlPage() {
  const [bank, pricing] = await Promise.all([getBankSettings(), fetchPricingConfig()])
  const amount = pricing.campaignActive && pricing.campaignFamilyGel
    ? Number(pricing.campaignFamilyGel)
    : Number(pricing.familyGel || 399)

  return <AileFormClient bank={bank} amount={amount} />
}
