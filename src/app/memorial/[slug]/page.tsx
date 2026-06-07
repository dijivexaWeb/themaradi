import type { Metadata } from 'next'
import MemorialPageClient from './MemorialPageClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Ahmet Yilmaz - The Maradi',
  description: 'Digital memorial profile prepared for Ahmet Yilmaz. 1940-2020.',
}

export default function MemorialPage() {
  return <MemorialPageClient />
}
