import type { Metadata } from 'next'
import { fetchPricingConfig } from '@/lib/pricing'
import { resolveAmount } from '@/lib/currency'
import { getTranslation } from '@/i18n/server'
import { buildAlternateLanguages } from '@/lib/i18n/hreflang'
import AileFormClient from './_AileFormClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'Aile Paketi Satın Al',
  description: 'Tüm aile için ortak anma sayfası. Aile ağacı, ortak fotoğraf galerisi ve her üye için ayrı profil. Tek seferlik ödeme, ömür boyu erişim.',
  alternates: {
    canonical: `${APP_URL}/satin-al/aile`,
    languages: buildAlternateLanguages('/satin-al/aile'),
  },
  openGraph: {
    title: 'Aile Paketi Satın Al — The Eternal Memory',
    description: 'Aile ağacı ve ortak anma sayfası — tek seferlik ödeme.',
    url: `${APP_URL}/satin-al/aile`,
    type: 'website',
  },
}

export default async function AileSatinAlPage() {
  const { lang } = await getTranslation()

  const pricing = await fetchPricingConfig()

  const { amount, currency } = resolveAmount(lang, {
    campaignActive: pricing.campaignActive,
    try_: pricing.familyTry, gel: pricing.familyGel, usd: pricing.familyUsd, rub: pricing.familyRub,
    campaignTry: pricing.campaignFamilyTry, campaignGel: pricing.campaignFamilyGel, campaignUsd: pricing.campaignFamilyUsd, campaignRub: pricing.campaignFamilyRub,
    fallbackGel: Number(pricing.familyGel || 399),
  })

  return <AileFormClient amount={amount} currency={currency} />
}
