import type { Metadata } from 'next'
import VerificationPolicyClient from './VerificationPolicyClient'
import { getTranslation } from '@/i18n/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation()
  const m = t.seoMeta.verificationPolicy
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${APP_URL}/legal/verification-policy` },
  }
}

export default function VerificationPolicyPage() {
  return <VerificationPolicyClient />
}
