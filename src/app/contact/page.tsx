import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'
import { getTurnstileSiteKey } from '@/lib/turnstile'

export const metadata: Metadata = {
  title: 'İletişim — The Eternal Memory',
  description:
    'The Eternal Memory ile iletişime geçin. Batumi, Gürcistan ofisimiz — Anma Profili, Yaşam Kasası ve QR plaka soruları için.',
}

export default async function ContactPage() {
  const siteKey = await getTurnstileSiteKey()
  return <ContactPageClient siteKey={siteKey} />
}
