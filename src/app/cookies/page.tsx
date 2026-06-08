import type { Metadata } from 'next'
import CookiesClient from './CookiesClient'

export const metadata: Metadata = {
  title: 'Cookie Policy — The Eternal Memory',
}

export default function CookiesPage() {
  return <CookiesClient />
}
