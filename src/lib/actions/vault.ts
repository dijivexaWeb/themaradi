'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function createVaultAction(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = formData.get('display_name') as string
  if (!displayName?.trim()) return

  const baseSlug = slugify(displayName)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { data, error } = await supabase
    .from('vaults')
    .insert({
      owner_id: user.id,
      display_name: displayName.trim(),
      slug,
      status: 'hidden_vault',
    })
    .select('id')
    .single()

  if (error || !data) return

  revalidatePath('/dashboard')
  redirect(`/dashboard/vault/${data.id}`)
}

export async function updateVaultAction(vaultId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const updates: Record<string, unknown> = {}
  const displayName = formData.get('display_name') as string
  const birthDate = formData.get('birth_date') as string
  const deathDate = formData.get('death_date') as string

  if (displayName) updates.display_name = displayName.trim()
  if (birthDate) updates.birth_date = birthDate
  if (deathDate) updates.death_date = deathDate

  const { error } = await supabase
    .from('vaults')
    .update(updates)
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/vault/${vaultId}`)
  return { success: true }
}

export async function updateBiographyAction(vaultId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Basic XSS: strip HTML tags, keep text only
  const sanitized = content.replace(/<[^>]*>/g, '')

  const { error } = await supabase
    .from('vaults')
    .update({ biography: sanitized })
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/vault/${vaultId}/biography`)
  return { success: true }
}

export async function deleteVaultAction(vaultId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('vaults')
    .delete()
    .eq('id', vaultId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function linkQRToVaultAction(vaultId: string, qrHash: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify vault ownership
  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()

  if (!vault) return { error: 'Kasa bulunamadı' }

  const { error } = await supabase
    .from('dynamic_qr')
    .update({
      target_vault_id: vaultId,
      activated_at: new Date().toISOString(),
    })
    .eq('qr_hash', qrHash)
    .is('target_vault_id', null)

  if (error) return { error: 'QR eşleştirme başarısız' }

  revalidatePath(`/dashboard/vault/${vaultId}/settings`)
  return { success: true }
}
