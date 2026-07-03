import type { Metadata } from 'next'
import KvkkClient from './KvkkClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  title: 'KVKK Disclosure Text — The Eternal Memory',
  alternates: { canonical: `${APP_URL}/kvkk` },
}

export default function KvkkPage() {
  return <KvkkClient />
}
