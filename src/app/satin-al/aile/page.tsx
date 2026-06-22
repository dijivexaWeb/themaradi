import type { Metadata } from 'next'
import { getBankSettings } from '@/lib/bank-settings'
import { fetchPricingConfig } from '@/lib/pricing'
import AileFormClient from './_AileFormClient'

export const metadata: Metadata = {
  title: 'Aile Paketi Satın Al',
  description: 'Tüm aile için ortak anma sayfası. Aile ağacı, ortak fotoğraf galerisi ve her üye için ayrı profil. Tek seferlik ödeme, ömür boyu erişim.',
  openGraph: {
    title: 'Aile Paketi Satın Al — The Eternal Memory',
    description: 'Aile ağacı ve ortak anma sayfası — tek seferlik ödeme.',
    type: 'website',
  },
}

export default async function AileSatinAlPage() {
  const [bank, pricing] = await Promise.all([getBankSettings(), fetchPricingConfig()])
  const amount = pricing.campaignActive && pricing.campaignFamilyGel
    ? Number(pricing.campaignFamilyGel)
    : Number(pricing.familyGel || 399)

  return <AileFormClient bank={bank} amount={amount} />
}
