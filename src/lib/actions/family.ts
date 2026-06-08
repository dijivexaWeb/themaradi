'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function cleanFilename(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return cleaned || 'photo'
}

async function assertOwner(supabase: Awaited<ReturnType<typeof createClient>>, vaultId: string, userId: string) {
  const { data } = await supabase.from('vaults').select('id, status').eq('id', vaultId).eq('owner_id', userId).single()
  if (!data) return null
  return data
}

async function uploadFamilyPhoto(vaultId: string, userId: string, formData: FormData): Promise<string | null> {
  const file = formData.get('photo_file')
  const urlInput = (formData.get('photo_url') as string)?.trim() || null

  if (file instanceof File && file.size > 0 && file.type.startsWith('image/')) {
    const service = await createServiceClient()
    const filename = cleanFilename(file.name)
    const path = `family/${vaultId}/${userId}/${Date.now()}-${filename}`
    const { error } = await service.storage.from('vault-media').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (!error) {
      const { data } = service.storage.from('vault-media').getPublicUrl(path)
      return data.publicUrl
    }
  }

  return urlInput
}

export async function addFamilyMemberAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault || vault.status === 'pending_verification') return

  const relationship = formData.get('relationship') as string
  const fullName = (formData.get('full_name') as string)?.trim()
  const birthDate = (formData.get('birth_date') as string) || null
  const deathDate = (formData.get('death_date') as string) || null
  const isAlive = formData.get('is_alive') !== 'false'
  const photoUrl = await uploadFamilyPhoto(vaultId, user.id, formData)
  const notes = (formData.get('notes') as string)?.trim() || null

  const validRels = ['mother','father','spouse','son','daughter','sibling','grandparent','grandchild','other']
  if (!fullName || !validRels.includes(relationship)) return

  const parentMemberId = (formData.get('parent_member_id') as string) || null

  await supabase.from('vault_family_members').insert({
    vault_id: vaultId,
    relationship,
    full_name: fullName,
    birth_date: birthDate,
    death_date: isAlive ? null : deathDate,
    is_alive: isAlive,
    photo_url: photoUrl,
    notes,
    parent_member_id: relationship === 'grandchild' ? parentMemberId : null,
  })

  revalidatePath(`/dashboard/vault/${vaultId}/aile`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}

export async function updateFamilyMemberAction(memberId: string, vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault || vault.status === 'pending_verification') return

  const relationship = formData.get('relationship') as string
  const fullName = (formData.get('full_name') as string)?.trim()
  const birthDate = (formData.get('birth_date') as string) || null
  const deathDate = (formData.get('death_date') as string) || null
  const isAlive = formData.get('is_alive') !== 'false'
  const photoUrl = await uploadFamilyPhoto(vaultId, user.id, formData)
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!fullName) return

  const parentMemberId = (formData.get('parent_member_id') as string) || null

  await supabase.from('vault_family_members')
    .update({
      relationship,
      full_name: fullName,
      birth_date: birthDate,
      death_date: isAlive ? null : deathDate,
      is_alive: isAlive,
      photo_url: photoUrl,
      notes,
      parent_member_id: relationship === 'grandchild' ? parentMemberId : null,
    })
    .eq('id', memberId)
    .eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/aile`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
  redirect(`/dashboard/vault/${vaultId}/aile`)
}

export async function deleteFamilyMemberAction(memberId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault) return

  await supabase.from('vault_family_members').delete().eq('id', memberId).eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/aile`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}
