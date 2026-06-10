'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function incrementMemorialActionAction(
  actionId: string,
  vaultId: string,
): Promise<{ success: boolean; newCount: number }> {
  const supabase = await createServiceClient()

  const { data: action } = await supabase
    .from('memorial_actions')
    .select('count')
    .eq('id', actionId)
    .eq('memorial_id', vaultId)
    .eq('is_active', true)
    .single()

  if (!action) return { success: false, newCount: 0 }

  const newCount = (action.count ?? 0) + 1
  await supabase.from('memorial_actions').update({ count: newCount }).eq('id', actionId)

  return { success: true, newCount }
}
