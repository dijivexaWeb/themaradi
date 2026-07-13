import type { Metadata } from 'next'
import CookiesClient from './CookiesClient'
import { getTranslation } from '@/i18n/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation()
  const m = t.seoMeta.cookies
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${APP_URL}/cookies` },
  }
}

export default function CookiesPage() {
  return <CookiesClient />
}
