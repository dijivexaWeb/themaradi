import type { Metadata } from 'next'
import AboutClient from './AboutClient'
import { getTranslation } from '@/i18n/server'
import { buildAlternateLanguages, buildCanonical } from '@/lib/i18n/hreflang'

const PATH = '/about'

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getTranslation()
  const m = t.seoMeta.about
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: buildCanonical(lang, PATH), languages: buildAlternateLanguages(PATH) },
    openGraph: { title: m.title, description: m.description, url: buildCanonical(lang, PATH), type: 'website' },
  }
}

export default function AboutPage() {
  return <AboutClient />
}
