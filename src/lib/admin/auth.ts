import { cache } from 'react'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// cache() deduplicates calls within the same request — layout + page share one result
const getAdminSession = cache(async () => {
  // createClient (cookie-based) → kullanıcı oturumunu okumak için
  const authClient = await createClient()
  const { data: { user }, error } = await authClient.auth.getUser()
  if (error || !user) return null

  // createServiceClient (service role) → profiles tablosunu RLS bypass ile sorgulamak için
  const supabase = await createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return { user, profile }
})

export async function requireAdmin() {
  const ctx = await getAdminSession()
  if (!ctx) redirect('/admin/login')
  return ctx
}

export async function getAdminContext() {
  return getAdminSession()
}
