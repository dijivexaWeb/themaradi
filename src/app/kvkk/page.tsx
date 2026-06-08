import type { Metadata } from 'next'
import KvkkClient from './KvkkClient'

export const metadata: Metadata = {
  title: 'KVKK Disclosure Text — The Eternal Memory',
}

export default function KvkkPage() {
  return <KvkkClient />
}
