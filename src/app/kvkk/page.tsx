import type { Metadata } from 'next'
import KvkkClient from './KvkkClient'

export const metadata: Metadata = {
  title: 'KVKK Disclosure Text — The Maradi',
}

export default function KvkkPage() {
  return <KvkkClient />
}
