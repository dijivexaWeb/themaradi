import type { Metadata } from 'next'
import PrivacyClient from './PrivacyClient'
import { getTranslation } from '@/i18n/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

// Bu sayfa dil öneki (/en, /ka ...) almıyor — ELIGIBLE_PREFIXES'te yok, o URL'ler
// mevcut değil. Bu yüzden tek bir canonical'a sabitliyoruz; sadece title/description
// ziyaretçinin tm_lang cookie'sine göre yerelleşiyor.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation()
  const m = t.seoMeta.privacy
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${APP_URL}/privacy` },
  }
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
