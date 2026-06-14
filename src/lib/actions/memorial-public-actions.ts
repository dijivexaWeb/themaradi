'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function incrementMemorialActionAction(
  actionId: string,
  vaultId: string,
): Promise<{ success: boolean; newCount: number }> {
  const supabase = await createServiceClient()

  const { data: newCount, error } = await supabase.rpc('increment_memorial_action_count', {
    p_action_id: actionId,
    p_vault_id: vaultId,
  })

  if (error || newCount === null) return { success: false, newCount: 0 }

  return { success: true, newCount: newCount as number }
}
