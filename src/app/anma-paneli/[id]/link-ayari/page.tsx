import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import QrLinkClient from './_QrLinkClient'
import QRCode from 'qrcode'

interface Props { params: Promise<{ id: string }> }

export default async function LinkAyariPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, slug, qr_id, display_name')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!vault) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'
  const qrUrl = `${baseUrl}/q/${vault.qr_id}`

  // QR PNG olarak server'da üret
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#0c3327', light: '#fffdf7' },
  })

  return (
    <QrLinkClient
      vaultId={id}
      currentSlug={vault.slug ?? ''}
      qrId={vault.qr_id}
      qrDataUrl={qrDataUrl}
      qrUrl={qrUrl}
      displayName={vault.display_name ?? ''}
    />
  )
}
