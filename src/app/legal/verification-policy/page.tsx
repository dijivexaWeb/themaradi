import type { Metadata } from 'next'
import VerificationPolicyClient from './VerificationPolicyClient'

export const metadata: Metadata = {
  title: 'Verification and Objection Policy — The Eternal Memory',
  description: 'Memorial Profile identity verification process, document requirements and 14-day objection window.',
}

export default function VerificationPolicyPage() {
  return <VerificationPolicyClient />
}
