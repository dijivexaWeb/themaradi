import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import KargoClient from './_KargoClient'

export default async function KargoPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: vaults } = await supabase
    .from('vaults')
    .select(`
      id,
      display_name,
      shipping_address,
      shipping_status,
      tracking_number,
      tracking_carrier,
      shipped_at,
      delivered_at,
      shipping_confirmed_at,
      owner_id,
      profiles!vaults_owner_id_fkey(full_name, email, phone)
    `)
    .eq('product_type', 'memorial_profile')
    .not('shipping_address', 'is', null)
    .order('created_at', { ascending: false })

  const rows = (vaults ?? []).map((v) => {
    const p = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
    return {
      id: v.id,
      display_name: v.display_name,
      shipping_address: v.shipping_address,
      shipping_status: v.shipping_status ?? 'pending',
      tracking_number: v.tracking_number,
      tracking_carrier: v.tracking_carrier,
      shipped_at: v.shipped_at,
      delivered_at: v.delivered_at,
      shipping_confirmed_at: v.shipping_confirmed_at,
      ownerName: (p as { full_name?: string })?.full_name ?? null,
      ownerEmail: (p as { email?: string })?.email ?? null,
      ownerPhone: (p as { phone?: string })?.phone ?? null,
    }
  })

  return <KargoClient vaults={rows} />
}
