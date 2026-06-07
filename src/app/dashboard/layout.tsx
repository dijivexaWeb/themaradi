import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CreditCard,
  Eye,
  Headphones,
  Home,
  LogOut,
  QrCode,
  ShieldCheck,
} from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: firstArea }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('vaults')
      .select('id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const initial = (profile?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()
  const areaHref = firstArea ? `/dashboard/vault/${firstArea.id}` : '/dashboard'

  const navItems = [
    { href: areaHref, label: 'Anı Alanım', icon: Home },
    { href: '/dashboard/billing', label: 'Abonelik', icon: CreditCard },
    { href: firstArea ? `/dashboard/vault/${firstArea.id}/onizleme` : '/dashboard', label: 'Profil Önizleme', icon: Eye },
    { href: firstArea ? `/dashboard/vault/${firstArea.id}/settings` : '/dashboard', label: 'Yayın ve QR Ayarları', icon: QrCode },
  ]

  return (
    <div className="theme-memorial min-h-screen bg-[#fbf8f0] text-[#173d31]">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 flex-col border-r border-[#e5dccb] bg-[#fffdf7]/95 px-4 py-7 shadow-[18px_0_55px_rgba(64,48,24,0.06)] lg:flex">
        <div className="px-4">
          <BrandLogo href="/" className="text-[#173d31]" />
        </div>

        <nav className="mt-9 flex-1 space-y-2">
          {navItems.map(({ href, label, icon: Icon }, index) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                index === 0
                  ? 'bg-[#174f35] text-white shadow-[0_14px_35px_rgba(23,79,53,0.22)]'
                  : 'text-[#23382f] hover:bg-[#f5efdf]'
              }`}
            >
              <Icon className={`h-4 w-4 ${index === 0 ? 'text-[#dfbd72]' : 'text-[#7b837d]'}`} />
              {label}
            </Link>
          ))}
        </nav>

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Paneli
          </Link>
        )}

        <div className="rounded-2xl border border-[#e5dccb] bg-white/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174f35] text-sm font-bold text-[#f7df9d]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#21372e]">{profile?.full_name ?? 'The Maradi Üyesi'}</div>
              <div className="truncate text-xs text-[#7b837d]">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Link href="/contact" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#69766f] hover:bg-[#f5efdf]">
            <Headphones className="h-4 w-4" />
            Yardım & Destek
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#69766f] hover:bg-[#f5efdf]">
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e5dccb] bg-[#fffdf7]/95 px-4 py-3 backdrop-blur lg:hidden">
        <BrandLogo href={areaHref} className="text-[#173d31]" />
        <Link href="/dashboard/billing" className="rounded-full border border-[#e5dccb] px-3 py-1.5 text-xs font-semibold text-[#174f35]">
          Abonelik
        </Link>
      </header>

      <main className="min-h-screen lg:pl-72">
        {children}
      </main>
    </div>
  )
}
