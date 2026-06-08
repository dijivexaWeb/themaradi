import type { Metadata } from 'next'
import QrPendingClient from './QrPendingClient'

export const metadata: Metadata = {
  title: 'Profil Hazırlanıyor — The Eternal Memory',
  robots: { index: false },
}

export default async function QrPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  return <QrPendingClient code={code} />
}
