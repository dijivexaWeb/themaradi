import type { Metadata } from 'next'
import { getBankSettings } from '@/lib/bank-settings'
import { fetchPricingConfig } from '@/lib/pricing'
import { getTranslation } from '@/i18n/server'
import AnmaFormClient from './_AnmaFormClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'Anma Profili Satın Al',
  description: 'Sevdikleriniz için dijital anma profili oluşturun. Tek seferlik ödeme, ömür boyu erişim. Fotoğraflar, hayat hikayesi, aile ağacı ve QR mezar taşı dahil.',
  alternates: {
    canonical: `${APP_URL}/satin-al/anma`,
  },
  openGraph: {
    title: 'Anma Profili Satın Al — The Eternal Memory',
    description: 'Dijital anma profili — tek seferlik ödeme, ömür boyu erişim.',
    url: `${APP_URL}/satin-al/anma`,
    type: 'website',
  },
}

interface Props {
  searchParams: Promise<{ lang?: string }>
}

export default async function AnmaSatinAlPage({ searchParams }: Props) {
  const params = await searchParams
  const { lang: cookieLang } = await getTranslation()
  const effectiveLang = params.lang || cookieLang

  const [bank, pricing] = await Promise.all([getBankSettings(), fetchPricingConfig()])

  let amount: number
  let currency: string

  if (effectiveLang === 'tr') {
    amount = pricing.campaignActive && pricing.campaignMemorialTry
      ? Number(pricing.campaignMemorialTry)
      : Number(pricing.memorialTry || pricing.memorialPrice)
    currency = '₺'
  } else if (effectiveLang === 'ka') {
    amount = pricing.campaignActive && pricing.campaignMemorial
      ? Number(pricing.campaignMemorial)
      : Number(pricing.memorialPrice)
    currency = '₾'
  } else {
    // he, en, ru, hy, az → USD
    amount = pricing.campaignActive && pricing.campaignMemorialUsd
      ? Number(pricing.campaignMemorialUsd)
      : Number(pricing.memorialUsd || pricing.memorialPrice)
    currency = '$'
  }

  return <AnmaFormClient bank={bank} amount={amount} currency={currency} forceLang={params.lang} />
}
