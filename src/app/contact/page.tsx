import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'
import { getTurnstileSiteKey } from '@/lib/turnstile'

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'The Eternal Memory ile iletişime geçin. Batumi, Gürcistan ofisimiz — dijital anma profili, aile paketi ve QR mezar taşı soruları için. WhatsApp ile hızlı destek.',
  openGraph: {
    title: 'İletişim — The Eternal Memory',
    description: 'Batumi, Gürcistan — dijital anma profili ve QR mezar taşı için iletişim.',
    type: 'website',
  },
}

export default async function ContactPage() {
  const siteKey = await getTurnstileSiteKey()
  return <ContactPageClient siteKey={siteKey} />
}
