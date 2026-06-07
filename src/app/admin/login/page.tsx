import type { Metadata } from 'next'
import AdminLoginForm from './AdminLoginForm'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin Girişi — The Maradi',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  // Already logged in and admin? Send straight to panel
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (user) {
    const service = await createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') redirect('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl text-white">The Maradi</span>
          <p className="mt-1 text-xs tracking-[0.2em] uppercase text-slate-500">
            Yönetim Paneli
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <h1 className="mb-6 text-center text-lg font-semibold text-white">
            Admin Girişi
          </h1>
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Bu sayfa yalnızca yetkili yöneticilere aittir.
        </p>
      </div>
    </div>
  )
}
