import type { Metadata } from 'next'
import { getBankSettings } from '@/lib/bank-settings'
import { fetchPricingConfig } from '@/lib/pricing'
import { getTranslation } from '@/i18n/server'
import AileFormClient from './_AileFormClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'Aile Paketi Satın Al',
  description: 'Tüm aile için ortak anma sayfası. Aile ağacı, ortak fotoğraf galerisi ve her üye için ayrı profil. Tek seferlik ödeme, ömür boyu erişim.',
  alternates: {
    canonical: `${APP_URL}/satin-al/aile`,
  },
  openGraph: {
    title: 'Aile Paketi Satın Al — The Eternal Memory',
    description: 'Aile ağacı ve ortak anma sayfası — tek seferlik ödeme.',
    url: `${APP_URL}/satin-al/aile`,
    type: 'website',
  },
}

interface Props {
  searchParams: Promise<{ lang?: string }>
}

export default async function AileSatinAlPage({ searchParams }: Props) {
  const params = await searchParams
  const { lang: cookieLang } = await getTranslation()
  const effectiveLang = params.lang || cookieLang

  const [bank, pricing] = await Promise.all([getBankSettings(), fetchPricingConfig()])

  let amount: number
  let currency: string

  if (effectiveLang === 'tr') {
    amount = pricing.campaignActive && pricing.campaignFamilyTry
      ? Number(pricing.campaignFamilyTry)
      : Number(pricing.familyTry || pricing.familyGel || 399)
    currency = '₺'
  } else if (effectiveLang === 'ka') {
    amount = pricing.campaignActive && pricing.campaignFamilyGel
      ? Number(pricing.campaignFamilyGel)
      : Number(pricing.familyGel || 399)
    currency = '₾'
  } else {
    amount = pricing.campaignActive && pricing.campaignFamilyUsd
      ? Number(pricing.campaignFamilyUsd)
      : Number(pricing.familyUsd || pricing.familyGel || 399)
    currency = '$'
  }

  return <AileFormClient bank={bank} amount={amount} currency={currency} forceLang={params.lang} />
}
