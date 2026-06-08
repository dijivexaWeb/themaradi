import type { Metadata } from 'next'
import PrivacyClient from './PrivacyClient'

export const metadata: Metadata = {
  title: 'Privacy Policy — The Eternal Memory',
  description: 'The Eternal Memory personal data processing policy. GDPR, Georgian PDL and KVKK compliant.',
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
