import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'
import { getTurnstileSiteKey } from '@/lib/turnstile'
import { buildAlternateLanguages, buildCanonical } from '@/lib/i18n/hreflang'
import { getTranslation } from '@/i18n/server'

const PATH = '/contact'

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getTranslation()
  const m = t.seoMeta.contact
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: buildCanonical(lang, PATH), languages: buildAlternateLanguages(PATH) },
    openGraph: { title: m.title, description: m.description, url: buildCanonical(lang, PATH), type: 'website' },
  }
}

export default async function ContactPage() {
  const siteKey = await getTurnstileSiteKey()
  return <ContactPageClient siteKey={siteKey} />
}
