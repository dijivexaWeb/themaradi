import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MemorialStyleClient from './_MemorialStyleClient'

interface Props { params: Promise<{ id: string }> }

export default async function AnmaTarziPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault) notFound()

  const { data: style } = await supabase
    .from('memorial_styles')
    .select('selected_template_key')
    .eq('memorial_id', id)
    .single()

  const { data: actions } = await supabase
    .from('memorial_actions')
    .select('id, label, icon, is_active, show_counter, count, sort_order')
    .eq('memorial_id', id)
    .order('sort_order', { ascending: true })

  return (
    <MemorialStyleClient
      vaultId={id}
      initialTemplateKey={style?.selected_template_key ?? null}
      initialActions={actions ?? []}
    />
  )
}
