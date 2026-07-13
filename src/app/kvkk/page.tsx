import type { Metadata } from 'next'
import KvkkClient from './KvkkClient'
import { getTranslation } from '@/i18n/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation()
  const m = t.seoMeta.kvkk
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${APP_URL}/kvkk` },
  }
}

export default function KvkkPage() {
  return <KvkkClient />
}
