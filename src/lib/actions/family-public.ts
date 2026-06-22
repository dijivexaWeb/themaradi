'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitFamilyCondolenceAction(
  familyId: string,
  _slug: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const authorName = (formData.get('author_name') as string)?.trim()
  const authorEmail = (formData.get('author_email') as string)?.trim() || null
  const message = (formData.get('message') as string)?.trim()
  const relation = (formData.get('relation') as string)?.trim() || null
  const messageType = (formData.get('message_type') as string)?.trim()

  if (!authorName || !message) return { ok: false, error: 'Ad ve mesaj zorunludur.' }
  if (!messageType || !['taziye', 'ani'].includes(messageType)) return { ok: false, error: 'Mesaj türü seçiniz.' }
  if (message.length > 1000) return { ok: false, error: 'Mesaj çok uzun (max 1000 karakter).' }

  const supabase = await createClient()
  const { error } = await supabase.from('family_guestbook').insert({
    family_id: familyId,
    author_name: authorName,
    author_email: authorEmail,
    message,
    relation,
    status: 'pending',
    message_type: messageType,
  })

  if (error) return { ok: false, error: 'Mesaj gönderilemedi.' }

  revalidatePath(`/aile/${_slug}`)
  return { ok: true }
}

export async function incrementFamilyActionAction(
  familyId: string,
  _slug: string,
  actionType: string
): Promise<{ ok: boolean; count?: number }> {
  const allowed = ['candle', 'flower', 'prayer', 'heart', 'star', 'silence']
  if (!allowed.includes(actionType)) return { ok: false }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('increment_family_action', {
    p_family_id: familyId,
    p_action_type: actionType,
  })

  if (error) return { ok: false }
  revalidatePath(`/aile/${_slug}`)
  return { ok: true, count: data as number }
}

export async function approveFamilyCondolenceAction(
  entryId: string,
  familyId: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: family } = await supabase
    .from('memorial_families')
    .select('id, slug')
    .eq('id', familyId)
    .eq('owner_id', user.id)
    .single()
  if (!family) return

  await supabase.from('family_guestbook').update({ status: 'approved' }).eq('id', entryId).eq('family_id', familyId)
  revalidatePath(`/aile/${family.slug}`)
  revalidatePath(`/anma-paneli/aile/${familyId}`)
}

export async function rejectFamilyCondolenceAction(
  entryId: string,
  familyId: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: family } = await supabase
    .from('memorial_families')
    .select('id')
    .eq('id', familyId)
    .eq('owner_id', user.id)
    .single()
  if (!family) return

  await supabase.from('family_guestbook').delete().eq('id', entryId).eq('family_id', familyId)
  revalidatePath(`/anma-paneli/aile/${familyId}`)
}
