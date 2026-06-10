import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MezarClient from './_MezarClient'

interface Props { params: Promise<{ id: string }> }

export default async function MemorialMezarPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status, cemetery_name, cemetery_address, cemetery_lat, cemetery_lng, cemetery_plot, cemetery_row, cemetery_hours, cemetery_note')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault) notFound()

  return (
    <MezarClient
      id={id}
      displayName={vault.display_name ?? ''}
      isLocked={vault.status === 'pending_verification'}
      hasCemetery={!!(vault.cemetery_name || vault.cemetery_lat)}
      initialData={{
        cemetery_name: vault.cemetery_name ?? '',
        cemetery_address: vault.cemetery_address ?? '',
        cemetery_lat: vault.cemetery_lat as number | null,
        cemetery_lng: vault.cemetery_lng as number | null,
        cemetery_plot: vault.cemetery_plot ?? '',
        cemetery_row: vault.cemetery_row ?? '',
        cemetery_hours: vault.cemetery_hours ?? '',
        cemetery_note: vault.cemetery_note ?? '',
      }}
    />
  )
}
