import type { Metadata } from 'next'
import { fetchPricingConfig } from '@/lib/pricing'
import { resolveAmount } from '@/lib/currency'
import { getTranslation } from '@/i18n/server'
import { buildAlternateLanguages } from '@/lib/i18n/hreflang'
import AnmaFormClient from './_AnmaFormClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'Anma Profili Satın Al',
  description: 'Sevdikleriniz için dijital anma profili oluşturun. Tek seferlik ödeme, ömür boyu erişim. Fotoğraflar, hayat hikayesi, aile ağacı ve QR mezar taşı dahil.',
  alternates: {
    canonical: `${APP_URL}/satin-al/anma`,
    languages: buildAlternateLanguages('/satin-al/anma'),
  },
  openGraph: {
    title: 'Anma Profili Satın Al — The Eternal Memory',
    description: 'Dijital anma profili — tek seferlik ödeme, ömür boyu erişim.',
    url: `${APP_URL}/satin-al/anma`,
    type: 'website',
  },
}

export default async function AnmaSatinAlPage() {
  const { lang } = await getTranslation()

  const pricing = await fetchPricingConfig()

  const { amount, currency } = resolveAmount(lang, {
    campaignActive: pricing.campaignActive,
    try_: pricing.memorialTry, gel: pricing.memorialPrice, usd: pricing.memorialUsd, rub: pricing.memorialRub,
    campaignTry: pricing.campaignMemorialTry, campaignGel: pricing.campaignMemorial, campaignUsd: pricing.campaignMemorialUsd, campaignRub: pricing.campaignMemorialRub,
    fallbackGel: Number(pricing.memorialPrice),
  })

  return <AnmaFormClient amount={amount} currency={currency} />
}
