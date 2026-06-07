import type { Metadata } from 'next'
import PricingClient from './PricingClient'
import { fetchPricingConfig } from '@/lib/pricing'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pricing — The Maradi',
  description:
    'Memorial Profile or Life Vault — bring your loved ones\' memories into the digital realm. QR grave plate from Georgia included.',
}

export default async function PricingPage() {
  const pricing = await fetchPricingConfig()
  return <PricingClient pricing={pricing} />
}
