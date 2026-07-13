import type { Metadata } from 'next'
import TermsClient from './TermsClient'
import { getTranslation } from '@/i18n/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation()
  const m = t.seoMeta.terms
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${APP_URL}/terms` },
  }
}

export default function TermsPage() {
  return <TermsClient />
}
