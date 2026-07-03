import type { Metadata } from 'next'
import PricingClient from './PricingClient'
import { fetchPricingConfig } from '@/lib/pricing'

export const revalidate = 3600

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'Fiyatlar — Dijital Anma Profili',
  description:
    'The Eternal Memory fiyatları: Anma Profili, Aile Paketi ve Yaşam Kasası. Tek seferlik ödeme, ömür boyu erişim. QR mezar taşı dahil. Gürcistan\'dan dünyaya hizmet.',
  alternates: {
    canonical: `${APP_URL}/pricing`,
  },
  openGraph: {
    title: 'Fiyatlar — The Eternal Memory',
    description: 'Dijital anma profili fiyatları. Tek seferlik ödeme, ömür boyu erişim.',
    url: `${APP_URL}/pricing`,
    type: 'website',
  },
}

export default async function PricingPage() {
  const pricing = await fetchPricingConfig()
  return <PricingClient pricing={pricing} />
}
