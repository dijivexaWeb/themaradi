import type { Metadata } from 'next'
import TermsClient from './TermsClient'

export const metadata: Metadata = {
  title: 'Terms of Service — The Maradi',
  description: 'The Maradi terms of service, payment and refund policy.',
}

export default function TermsPage() {
  return <TermsClient />
}
