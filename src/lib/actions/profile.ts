'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveProfileAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: v } = await supabase.from('vaults').select('status').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!v || v.status === 'pending_verification') return

  const displayName = (formData.get('display_name') as string)?.trim()

  await supabase.from('vaults').update({
    ...(displayName ? { display_name: displayName } : {}),
    tagline: (formData.get('tagline') as string)?.trim() || null,
    birth_date: (formData.get('birth_date') as string) || null,
    death_date: (formData.get('death_date') as string) || null,
    birth_place: (formData.get('birth_place') as string)?.trim() || null,
    death_place: (formData.get('death_place') as string)?.trim() || null,
    cover_photo_url: (formData.get('cover_photo_url') as string)?.trim() || null,
    last_message: (formData.get('last_message') as string)?.trim() || null,
    cemetery_name: (formData.get('cemetery_name') as string)?.trim() || null,
    cemetery_address: (formData.get('cemetery_address') as string)?.trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', vaultId).eq('owner_id', user.id)

  revalidatePath(`/dashboard/vault/${vaultId}`)
  revalidatePath(`/dashboard/vault/${vaultId}/profil`)
}
