import type { Metadata } from 'next'
import { getBankSettings } from '@/lib/bank-settings'
import { fetchPricingConfig } from '@/lib/pricing'
import AnmaFormClient from './_AnmaFormClient'

export const metadata: Metadata = {
  title: 'Anma Profili Satın Al',
  description: 'Sevdikleriniz için dijital anma profili oluşturun. Tek seferlik ödeme, ömür boyu erişim. Fotoğraflar, hayat hikayesi, aile ağacı ve QR mezar taşı dahil.',
  openGraph: {
    title: 'Anma Profili Satın Al — The Eternal Memory',
    description: 'Dijital anma profili — tek seferlik ödeme, ömür boyu erişim.',
    type: 'website',
  },
}

export default async function AnmaSatinAlPage() {
  const [bank, pricing] = await Promise.all([getBankSettings(), fetchPricingConfig()])
  const amount = pricing.campaignActive && pricing.campaignMemorial
    ? Number(pricing.campaignMemorial)
    : Number(pricing.memorialPrice)

  return <AnmaFormClient bank={bank} amount={amount} />
}
