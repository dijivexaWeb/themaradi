'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPublicUrl } from '@/lib/r2'

export async function approveFamilyGuestbookAction(entryId: string, vaultId: string, familyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  await supabase.from('guestbook_entries').update({ status: 'approved' }).eq('id', entryId).eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/aile/${familyId}`)
  revalidatePath(`/anma-paneli/${vaultId}/taziye`)
}

export async function rejectFamilyGuestbookAction(entryId: string, vaultId: string, familyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id').eq('id', vaultId).eq('owner_id', user.id).single()
  if (!vault) return

  await supabase.from('guestbook_entries').delete().eq('id', entryId).eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/aile/${familyId}`)
  revalidatePath(`/anma-paneli/${vaultId}/taziye`)
}

async function assertFamilyOwner(familyId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('memorial_families')
    .select('id, owner_id')
    .eq('id', familyId)
    .eq('owner_id', userId)
    .single()
  return data
}

export async function updateFamilyInfoAction(familyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  const name = (formData.get('name') as string)?.trim()
  const tagline = (formData.get('tagline') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim() || null
  const isPublic = formData.get('is_public') !== 'false'

  if (!name) return

  await supabase
    .from('memorial_families')
    .update({ name, tagline, description, is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('id', familyId)

  revalidatePath(`/anma-paneli/aile/${familyId}`)
  redirect(`/anma-paneli/aile/${familyId}`)
}

export async function addFamilyVaultMemberAction(familyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  const vaultId = (formData.get('vault_id') as string)?.trim()
  if (!vaultId) return

  const { data: vault } = await supabase
    .from('vaults')
    .select('id')
    .eq('id', vaultId)
    .eq('owner_id', user.id)
    .single()
  if (!vault) return

  await supabase
    .from('family_members')
    .upsert({ family_id: familyId, vault_id: vaultId }, { onConflict: 'family_id,vault_id', ignoreDuplicates: true })

  revalidatePath(`/anma-paneli/aile/${familyId}`)
  revalidatePath(`/anma-paneli`)
}

export async function removeFamilyVaultMemberAction(familyId: string, vaultId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  await supabase
    .from('family_members')
    .delete()
    .eq('family_id', familyId)
    .eq('vault_id', vaultId)

  revalidatePath(`/anma-paneli/aile/${familyId}`)
  revalidatePath(`/anma-paneli`)
}

export async function addFamilyPhotoAction(familyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  const caption = (formData.get('caption') as string)?.trim() || null

  // R2 yükleme veya URL
  const fileKey = (formData.get('file_key') as string)?.trim()
  const fallbackUrl = (formData.get('photo_url') as string)?.trim()
  const url = fileKey ? getPublicUrl(fileKey) : fallbackUrl
  if (!url) return

  await supabase.from('family_media').insert({
    family_id: familyId,
    original_url: url,
    caption,
    uploaded_by: user.id,
  })

  revalidatePath(`/anma-paneli/aile/${familyId}`)
}

export async function deleteFamilyPhotoAction(familyId: string, photoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  await supabase.from('family_media').delete().eq('id', photoId).eq('family_id', familyId)
  revalidatePath(`/anma-paneli/aile/${familyId}`)
}

export async function addFamilyMemoryAction(familyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  const title = (formData.get('title') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const memoryDate = (formData.get('memory_date') as string) || null
  if (!content) return

  await supabase.from('family_memories').insert({
    family_id: familyId,
    title,
    content,
    memory_date: memoryDate || null,
    added_by: user.id,
  })

  revalidatePath(`/anma-paneli/aile/${familyId}`)
}

export async function editFamilyMemoryAction(familyId: string, memoryId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  const title = (formData.get('title') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const memoryDate = (formData.get('memory_date') as string) || null
  if (!content) return

  await supabase.from('family_memories').update({
    title,
    content,
    memory_date: memoryDate || null,
  }).eq('id', memoryId).eq('family_id', familyId)

  revalidatePath(`/anma-paneli/aile/${familyId}`)
}

export async function deleteFamilyMemoryAction(familyId: string, memoryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  await supabase.from('family_memories').delete().eq('id', memoryId).eq('family_id', familyId)
  revalidatePath(`/anma-paneli/aile/${familyId}`)
}

export async function updateFamilySlugAction(
  familyId: string,
  slug: string
): Promise<{ ok: boolean; error?: string; newSlug?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Giriş yapınız.' }

  const { data: family } = await supabase
    .from('memorial_families')
    .select('id, owner_id, slug_locked')
    .eq('id', familyId)
    .eq('owner_id', user.id)
    .single()
  if (!family) return { ok: false, error: 'Yetki yok.' }
  if (family.slug_locked) return { ok: false, error: 'Link daha önce belirlenmiş ve değiştirilemez.' }

  const clean = slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  if (clean.length < 3) return { ok: false, error: 'Link en az 3 karakter olmalı.' }
  if (clean.length > 60) return { ok: false, error: 'Link en fazla 60 karakter olabilir.' }

  const { data: existing } = await supabase
    .from('memorial_families')
    .select('id')
    .eq('slug', clean)
    .neq('id', familyId)
    .maybeSingle()
  if (existing) return { ok: false, error: 'Bu link başkası tarafından kullanılıyor.' }

  await supabase
    .from('memorial_families')
    .update({ slug: clean, slug_locked: true, updated_at: new Date().toISOString() })
    .eq('id', familyId)

  revalidatePath(`/anma-paneli/aile/${familyId}`)
  return { ok: true, newSlug: clean }
}

export async function updateEnabledActionsAction(familyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const family = await assertFamilyOwner(familyId, user.id)
  if (!family) return

  const all = ['candle', 'flower', 'prayer', 'heart', 'star', 'silence']
  const enabled = all.filter(a => formData.get(`action_${a}`) === 'on')

  const { data: updated } = await supabase
    .from('memorial_families')
    .update({ enabled_actions: enabled.length ? enabled : ['candle', 'flower', 'prayer'], updated_at: new Date().toISOString() })
    .eq('id', familyId)
    .select('slug')
    .single()

  revalidatePath(`/anma-paneli/aile/${familyId}`)
  if (updated?.slug) revalidatePath(`/aile/${updated.slug}`)
}

export async function createFamilyAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  if (!name) return

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  const { data: family, error } = await supabase
    .from('memorial_families')
    .insert({ owner_id: user.id, name, slug, is_public: false })
    .select('id')
    .single()

  if (error || !family) return

  const vaultId = (formData.get('vault_id') as string)?.trim()
  if (vaultId) {
    await supabase
      .from('family_members')
      .insert({ family_id: family.id, vault_id: vaultId })
  }

  revalidatePath('/anma-paneli')
  redirect(`/anma-paneli/aile/${family.id}`)
}
