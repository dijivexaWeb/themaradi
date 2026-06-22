import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'The Eternal Memory ekibini tanıyın. 2023\'te kurulan platform, dijital anma profilleri ve QR mezar taşı ile sevdiklerinizin anısını sonsuza taşır. Batumi, Gürcistan merkezli.',
  openGraph: {
    title: 'Hakkımızda — The Eternal Memory',
    description: 'Dijital anma profili ve QR mezar taşı platformunun hikayesi. Batumi, Gürcistan.',
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
