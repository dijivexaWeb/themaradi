import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'
import { getTurnstileSiteKey } from '@/lib/turnstile'
import { buildAlternateLanguages } from '@/lib/i18n/hreflang'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'The Eternal Memory ile iletişime geçin. Batumi, Gürcistan ofisimiz — dijital anma profili, aile paketi ve QR mezar taşı soruları için. WhatsApp ile hızlı destek.',
  alternates: {
    canonical: `${APP_URL}/contact`,
    languages: buildAlternateLanguages('/contact'),
  },
  openGraph: {
    title: 'İletişim — The Eternal Memory',
    description: 'Batumi, Gürcistan — dijital anma profili ve QR mezar taşı için iletişim.',
    url: `${APP_URL}/contact`,
    type: 'website',
  },
}

export default async function ContactPage() {
  const siteKey = await getTurnstileSiteKey()
  return <ContactPageClient siteKey={siteKey} />
}
