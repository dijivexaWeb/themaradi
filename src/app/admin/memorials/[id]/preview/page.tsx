import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RealMemorialPage from '@/app/memorial/[slug]/RealMemorialPage'

export default async function AdminVaultPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const supabase = await createServiceClient()
  const { id } = await params

  const { data: vault } = await supabase.from('vaults').select('*').eq('id', id).single()
  if (!vault) notFound()

  return <RealMemorialPage vault={vault} isPreview />
}
