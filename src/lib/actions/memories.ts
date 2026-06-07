'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function assertOwner(supabase: Awaited<ReturnType<typeof createClient>>, vaultId: string, userId: string) {
  const { data } = await supabase.from('vaults').select('id, status').eq('id', vaultId).eq('owner_id', userId).single()
  if (!data) return null
  return data
}

export async function addMemoryAction(vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const memoryDate = (formData.get('memory_date') as string) || null
  const isSecret = formData.get('is_secret') === 'true'

  if (!content) return

  await supabase.from('vault_memories').insert({
    vault_id: vaultId,
    title,
    content,
    memory_date: memoryDate,
    is_secret: isSecret,
  })

  revalidatePath(`/dashboard/vault/${vaultId}/anilar`)
  revalidatePath(`/dashboard/vault/${vaultId}/gizli-kasa`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}

export async function updateMemoryAction(memoryId: string, vaultId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault || vault.status === 'pending_verification') return

  const title = (formData.get('title') as string)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const memoryDate = (formData.get('memory_date') as string) || null

  if (!content) return

  await supabase.from('vault_memories')
    .update({ title, content, memory_date: memoryDate, updated_at: new Date().toISOString() })
    .eq('id', memoryId)
    .eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/anilar`)
  revalidatePath(`/dashboard/vault/${vaultId}/gizli-kasa`)
}

export async function deleteMemoryAction(memoryId: string, vaultId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vault = await assertOwner(supabase, vaultId, user.id)
  if (!vault) return

  await supabase.from('vault_memories').delete().eq('id', memoryId).eq('vault_id', vaultId)

  revalidatePath(`/dashboard/vault/${vaultId}/anilar`)
  revalidatePath(`/dashboard/vault/${vaultId}/gizli-kasa`)
  revalidatePath(`/dashboard/vault/${vaultId}`)
}
