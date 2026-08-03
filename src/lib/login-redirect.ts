import { createClient } from '@/lib/supabase/server'

export async function getLoginRedirectUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string> {
  // Life vault kullanıcıları eski dashboard'a git
  const { data: lifeVault } = await supabase
    .from('vaults')
    .select('id')
    .eq('owner_id', userId)
    .eq('product_type', 'life_vault')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lifeVault) return `/dashboard/vault/${lifeVault.id}`

  // Toplu içe aktarımdan gelen, henüz sahiplenilmemiş profil varsa
  // doğrudan Sahiplen ekranına git — liste sayfasında dolaştırma.
  const { data: unclaimedVault } = await supabase
    .from('vaults')
    .select('id')
    .eq('owner_id', userId)
    .eq('vault_origin', 'bulk_import')
    .eq('status', 'unclaimed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (unclaimedVault) return `/anma-paneli/${unclaimedVault.id}`

  // Memorial kullanıcıları → her zaman /anma-paneli'ye
  return '/anma-paneli'
}
