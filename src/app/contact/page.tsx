import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'İletişim — The Eternal Memory',
  description:
    'The Eternal Memory ile iletişime geçin. Batumi, Gürcistan ofisimiz — Anma Profili, Yaşam Kasası ve QR plaka soruları için.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
