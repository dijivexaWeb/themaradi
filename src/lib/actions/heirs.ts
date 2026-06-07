'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

export async function inviteHeirAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const email = formData.get('email') as string
  const accessLevel = formData.get('access_level') as string

  if (!email?.trim()) return
  if (!['executor', 'contributor', 'viewer'].includes(accessLevel)) return

  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) return

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const fullName = (formData.get('full_name') as string)?.trim() || null
  const relationship = (formData.get('relationship') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null

  await supabase.from('heirs').insert({
    vault_id: vaultId,
    heir_email: email.toLowerCase().trim(),
    access_level: accessLevel,
    status: 'pending',
    invitation_token: token,
    invitation_expires_at: expiresAt,
    full_name: fullName,
    relationship: relationship,
    phone: phone,
  })

  revalidatePath(`/dashboard/vault/${vaultId}/heirs`)
}

export async function revokeHeirAccessAction(heirId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) return

  await supabase
    .from('heirs')
    .delete()
    .eq('id', heirId)
    .eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/heirs`)
}
