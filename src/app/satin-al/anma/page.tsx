import { getBankSettings } from '@/lib/bank-settings'
import { fetchPricingConfig } from '@/lib/pricing'
import AnmaFormClient from './_AnmaFormClient'

export default async function AnmaSatinAlPage() {
  const [bank, pricing] = await Promise.all([getBankSettings(), fetchPricingConfig()])
  const amount = pricing.campaignActive && pricing.campaignMemorial
    ? Number(pricing.campaignMemorial)
    : Number(pricing.memorialPrice)

  return <AnmaFormClient bank={bank} amount={amount} />
}
