import type { Metadata } from 'next'
import VerificationPolicyClient from './VerificationPolicyClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'Verification and Objection Policy — The Eternal Memory',
  description: 'Memorial Profile identity verification process, document requirements and 14-day objection window.',
  alternates: { canonical: `${APP_URL}/legal/verification-policy` },
}

export default function VerificationPolicyPage() {
  return <VerificationPolicyClient />
}
