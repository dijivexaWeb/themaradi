import type { Metadata } from 'next'
import PricingClient from './PricingClient'
import { fetchPricingConfig } from '@/lib/pricing'
import { buildAlternateLanguages, buildCanonical } from '@/lib/i18n/hreflang'
import { getTranslation } from '@/i18n/server'

export const revalidate = 3600

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'
const PATH = '/pricing'

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getTranslation()
  const m = t.seoMeta.pricing
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: buildCanonical(lang, PATH), languages: buildAlternateLanguages(PATH) },
    openGraph: { title: m.title, description: m.description, url: buildCanonical(lang, PATH), type: 'website' },
  }
}

export default async function PricingPage() {
  const pricing = await fetchPricingConfig()

  const productsLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'Product',
        name: 'Anma Profili',
        description: 'QR mezar taşı dahil dijital anma profili — tek seferlik ödeme, ömür boyu erişim.',
        offers: {
          '@type': 'Offer',
          price: pricing.memorialPrice,
          priceCurrency: 'GEL',
          url: `${APP_URL}/satin-al/anma`,
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Product',
        name: 'Aile Paketi',
        description: '4 üyeli aile anma paketi — ortak aile sayfası ve QR mezar taşı dahil.',
        offers: {
          '@type': 'Offer',
          price: pricing.familyGel,
          priceCurrency: 'GEL',
          url: `${APP_URL}/satin-al/aile`,
          availability: 'https://schema.org/InStock',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsLd) }}
      />
      <PricingClient pricing={pricing} />
    </>
  )
}
