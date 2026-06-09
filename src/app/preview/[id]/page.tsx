import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyPreviewToken } from '@/lib/preview-token'
import { notFound, redirect } from 'next/navigation'
import RealMemorialPage from '@/app/memorial/[slug]/RealMemorialPage'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { id } = await params
  const { token } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const hasValidToken = verifyPreviewToken(id, token)

  if (!user && !hasValidToken) redirect('/login')

  if (hasValidToken) {
    const service = await createServiceClient()
    const { data: vault } = await service
      .from('vaults')
      .select('*')
      .eq('id', id)
      .single()

    if (!vault) notFound()
    return <RealMemorialPage vault={vault} isPreview />
  }

  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!vault) notFound()

  return <RealMemorialPage vault={vault} isPreview />
}
