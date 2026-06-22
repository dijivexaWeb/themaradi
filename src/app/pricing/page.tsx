import type { Metadata } from 'next'
import PricingClient from './PricingClient'
import { fetchPricingConfig } from '@/lib/pricing'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Fiyatlar — Dijital Anma Profili',
  description:
    'The Eternal Memory fiyatları: Anma Profili, Aile Paketi ve Yaşam Kasası. Tek seferlik ödeme, ömür boyu erişim. QR mezar taşı dahil. Gürcistan\'dan dünyaya hizmet.',
  openGraph: {
    title: 'Fiyatlar — The Eternal Memory',
    description: 'Dijital anma profili fiyatları. Tek seferlik ödeme, ömür boyu erişim.',
    type: 'website',
  },
}

export default async function PricingPage() {
  const pricing = await fetchPricingConfig()
  return <PricingClient pricing={pricing} />
}
