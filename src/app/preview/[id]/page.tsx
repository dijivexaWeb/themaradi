import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import RealMemorialPage from '@/app/memorial/[slug]/RealMemorialPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
