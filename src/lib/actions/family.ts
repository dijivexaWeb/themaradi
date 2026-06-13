'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generateFileKey, getPublicUrl, uploadR2Object } from '@/lib/r2'

async function assertOwner(supabase: Awaited<ReturnType<typeof createClient>>, vaultId: string, userId: string) {
  const { data } = await supabase.from('vaults').select('id, status').eq('id', vaultId).eq('owner_id', userId).single()
  if (!data) return null
  return data
}

async function uploadFamilyPhoto(vaultId: string, formData: FormData): Promise<string | null> {
  // R2ImageUpload sends file_key + bucket after client-side presigned upload
  const fileKey = (formData.get('file_key') as string | null)?.trim()
  const bucket = (formData.get('bucket') as string | null)?.trim()
  if (fileKey && bucket) {
    return getPublicUrl(fileKey)
  }

  // Direct file upload fallback
  const file = formData.get('photo_file')
  if (file instanceof File && file.size > 0 && file.type.startsWith('image/')) {
    try {
      const r2Bucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
      const key = generateFileKey('family_member', vaultId, file.name)
      const buffer = Buffer.from(await file.arrayBuffer())
      await uploadR2Object(r2Bucket, key, buffer, file.type)
      return getPublicUrl(key)
    } catch (e) {
      console.error('[uploadFamilyPhoto] R2 upload error:', e)
      return null
    }
  }

  // Manual URL input
  return (formData.get('photo_url') as string)?.trim() || null
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
  const birthDatePrecision = (formData.get('birth_date_precision') as string) || 'day'
  const deathDate = (formData.get('death_date') as string) || null
  const deathDatePrecision = (formData.get('death_date_precision') as string) || 'day'
  const isAlive = formData.get('is_alive') !== 'false'
  const photoUrl = await uploadFamilyPhoto(vaultId, formData)
  const notes = (formData.get('notes') as string)?.trim() || null

  const validRels = [
    'mother','father','spouse','son','daughter','sibling',
    'grandparent','grandchild','other',
    'gm_maternal','gf_maternal','gm_paternal','gf_paternal',
    'uncle','aunt',
  ]
  if (!fullName || !validRels.includes(relationship)) return

  const parentMemberId = (formData.get('parent_member_id') as string) || null

  await supabase.from('vault_family_members').insert({
    vault_id: vaultId,
    relationship,
    full_name: fullName,
    birth_date: birthDate,
    birth_date_precision: birthDate ? birthDatePrecision : null,
    death_date: isAlive ? null : deathDate,
    death_date_precision: !isAlive && deathDate ? deathDatePrecision : null,
    is_alive: isAlive,
    photo_url: photoUrl,
    notes,
    parent_member_id: parentMemberId,
  })

  revalidatePath(`/anma-paneli/${vaultId}/aile`)
  revalidatePath(`/anma-paneli/${vaultId}`)
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
  const birthDatePrecision = (formData.get('birth_date_precision') as string) || 'day'
  const deathDate = (formData.get('death_date') as string) || null
  const deathDatePrecision = (formData.get('death_date_precision') as string) || 'day'
  const isAlive = formData.get('is_alive') !== 'false'
  const photoUrl = await uploadFamilyPhoto(vaultId, formData)
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!fullName) return

  const parentMemberId = (formData.get('parent_member_id') as string) || null

  await supabase.from('vault_family_members')
    .update({
      relationship,
      full_name: fullName,
      birth_date: birthDate,
      birth_date_precision: birthDate ? birthDatePrecision : null,
      death_date: isAlive ? null : deathDate,
      death_date_precision: !isAlive && deathDate ? deathDatePrecision : null,
      is_alive: isAlive,
      photo_url: photoUrl,
      notes,
      parent_member_id: parentMemberId,
    })
    .eq('id', memberId)
    .eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/aile`)
  revalidatePath(`/anma-paneli/${vaultId}`)
  redirect(`/anma-paneli/${vaultId}/aile`)
}

export async function deleteFamilyMemberAction(memberId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault) return

  await supabase.from('vault_family_members').delete().eq('id', memberId).eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/${vaultId}/aile`)
  revalidatePath(`/anma-paneli/${vaultId}`)
}
