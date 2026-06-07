import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'İletişim — The Maradi',
  description:
    'The Maradi ile iletişime geçin. Batumi, Gürcistan ofisimiz — Anma Profili, Yaşam Kasası ve QR plaka soruları için.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
