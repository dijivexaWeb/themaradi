import type { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing — The Maradi',
  description:
    'Memorial Profile or Life Vault — bring your loved ones\' memories into the digital realm. QR grave plate from Georgia included.',
}

export default function PricingPage() {
  return <PricingClient />
}
