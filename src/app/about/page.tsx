import type { Metadata } from 'next'
import AboutClient from './AboutClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'The Eternal Memory ekibini tanıyın. 2023\'te kurulan platform, dijital anma profilleri ve QR mezar taşı ile sevdiklerinizin anısını sonsuza taşır. Batumi, Gürcistan merkezli.',
  alternates: {
    canonical: `${APP_URL}/about`,
  },
  openGraph: {
    title: 'Hakkımızda — The Eternal Memory',
    description: 'Dijital anma profili ve QR mezar taşı platformunun hikayesi. Batumi, Gürcistan.',
    url: `${APP_URL}/about`,
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
