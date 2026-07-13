import type { Metadata } from 'next'
import PricingClient from './PricingClient'
import { fetchPricingConfig } from '@/lib/pricing'
import { buildAlternateLanguages, buildCanonical } from '@/lib/i18n/hreflang'
import { getTranslation } from '@/i18n/server'
import { getBogSettings } from '@/lib/bog'

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
  const [pricing, bogSettings] = await Promise.all([fetchPricingConfig(), getBogSettings()])

  // Google'a bildirilen fiyat gerçek ödeme akışındaki fiyatla birebir eşleşmeli —
  // kampanya aktifken indirimli fiyat kullanılmazsa Google structured data
  // politikalarına aykırı düşer (rich result reddi riski).
  const memorialActivePrice = pricing.campaignActive && pricing.campaignMemorial
    ? pricing.campaignMemorial
    : pricing.memorialPrice
  const familyActivePrice = pricing.campaignActive && pricing.campaignFamilyGel
    ? pricing.campaignFamilyGel
    : pricing.familyGel

  const PRODUCT_IMAGE = 'https://pub-4e99edb14c604383a844cb7f05d69b9b.r2.dev/landing/qr.png'
  const BRAND = { '@type': 'Brand', name: 'The Eternal Memory' }
  const RETURN_POLICY = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'GE',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 30,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
  }

  const productsLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'Product',
        name: 'Anma Profili',
        description: 'QR mezar taşı dahil dijital anma profili — tek seferlik ödeme, ömür boyu erişim.',
        image: PRODUCT_IMAGE,
        brand: BRAND,
        offers: {
          '@type': 'Offer',
          price: memorialActivePrice,
          priceCurrency: 'GEL',
          url: `${APP_URL}/satin-al/anma`,
          availability: 'https://schema.org/InStock',
          priceValidUntil: pricing.campaignActive ? pricing.campaignEndsAt || undefined : undefined,
          hasMerchantReturnPolicy: RETURN_POLICY,
        },
      },
      {
        '@type': 'Product',
        name: 'Aile Paketi',
        description: '4 üyeli aile anma paketi — ortak aile sayfası ve QR mezar taşı dahil.',
        image: PRODUCT_IMAGE,
        brand: BRAND,
        offers: {
          '@type': 'Offer',
          price: familyActivePrice,
          priceCurrency: 'GEL',
          url: `${APP_URL}/satin-al/aile`,
          availability: 'https://schema.org/InStock',
          priceValidUntil: pricing.campaignActive ? pricing.campaignEndsAt || undefined : undefined,
          hasMerchantReturnPolicy: RETURN_POLICY,
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
      <PricingClient pricing={pricing} cardPaymentAvailable={bogSettings.enabled} />
    </>
  )
}
