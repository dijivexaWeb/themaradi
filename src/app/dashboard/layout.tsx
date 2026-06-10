import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import IdleLogout from '@/components/IdleLogout'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CreditCard, Eye, FileText, Headphones, Home,
  LockKeyhole, LogOut, QrCode, Scroll, Shield, ShieldCheck,
} from 'lucide-react'
import { getTranslation } from '@/i18n/server'
import LangSwitcherDashboard from '@/components/LangSwitcherDashboard'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getTranslation()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: firstArea }] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, role').eq('id', user.id).single(),
    supabase.from('vaults').select('id').eq('owner_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle(),
  ])

  const initial = (profile?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()
  const areaHref = firstArea ? `/dashboard/vault/${firstArea.id}` : '/dashboard'
  const v = (path: string) => firstArea ? `/dashboard/vault/${firstArea.id}/${path}` : '/dashboard'
  const previewHref = firstArea ? `/preview/${firstArea.id}` : '/dashboard'

  const mainNav = [
    { href: areaHref,          label: t.dashboard.sidebar.myMemorialArea, icon: Home },
    { href: '/dashboard/billing', label: t.dashboard.sidebar.subscription,   icon: CreditCard },
  ]

  const privateNav = [
    { href: v('vasiyet'),    label: t.dashboard.sidebar.will,     icon: Scroll },
    { href: v('gizli-kasa'), label: t.dashboard.sidebar.privateContents, icon: LockKeyhole },
    { href: v('heirs'),      label: t.dashboard.sidebar.heirInfo,  icon: Shield },
    { href: v('belgeler'),   label: t.dashboard.sidebar.documents,         icon: FileText },
    { href: v('settings'),   label: t.dashboard.sidebar.publishAndQR,       icon: QrCode },
  ]

  return (
    <div className="theme-memorial min-h-screen bg-[#fbf8f0] text-[#173d31]">
      <IdleLogout signoutPath="/auth/signout" redirectPath="/login" />
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 flex-col border-r border-[#e5dccb] bg-[#fffdf7]/95 px-4 py-7 shadow-[18px_0_55px_rgba(64,48,24,0.06)] lg:flex">
        <div className="px-4">
          <BrandLogo href="/" className="text-[#173d31]" />
        </div>

        {/* Ana navigasyon */}
        <nav className="mt-9 space-y-1.5">
          {mainNav.map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#23382f] transition-all hover:bg-[#f5efdf]">
              <Icon className="h-4 w-4 text-[#7b837d]" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Özel alan */}
        {firstArea && (
          <div className="mt-6">
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-[#adb5ab]">{t.dashboard.sidebar.privateArea}</p>
            <nav className="space-y-1">
              {privateNav.map(({ href, label, icon: Icon }) => (
                <Link key={label} href={href}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[#23382f] transition-all hover:bg-[#f5efdf]">
                  <Icon className="h-4 w-4 text-[#7b837d]" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        <div className="mt-auto space-y-1">
          {profile?.role === 'admin' && (
            <Link href="/admin"
              className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              {t.dashboard.sidebar.adminPanel}
            </Link>
          )}

          <Link href={previewHref} target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#69766f] hover:bg-[#f5efdf] transition-colors">
            <Eye className="h-4 w-4" />
            {t.dashboard.sidebar.profilePreview}
          </Link>
          <Link href="/contact"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#69766f] hover:bg-[#f5efdf] transition-colors">
            <Headphones className="h-4 w-4" />
            {t.dashboard.sidebar.helpAndSupport}
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#69766f] hover:bg-[#f5efdf] transition-colors">
              <LogOut className="h-4 w-4" />
              {t.dashboard.sidebar.signOut}
            </button>
          </form>

          <LangSwitcherDashboard />
        </div>

        <div className="mt-4 rounded-2xl border border-[#e5dccb] bg-white/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174f35] text-sm font-bold text-[#f7df9d]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#21372e]">{profile?.full_name ?? t.dashboard.sidebar.memberLabel}</div>
              <div className="truncate text-xs text-[#7b837d]">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e5dccb] bg-[#fffdf7]/95 px-4 py-3 backdrop-blur lg:hidden">
        <BrandLogo href={areaHref} className="text-[#173d31]" />
        <div className="flex items-center gap-3">
          <LangSwitcherDashboard className="flex gap-1 items-center" />
          <Link href="/dashboard/billing" className="rounded-full border border-[#e5dccb] px-3 py-1.5 text-xs font-semibold text-[#174f35] shrink-0">
            {t.dashboard.sidebar.subscription}
          </Link>
        </div>
      </header>

      <main className="min-h-screen lg:pl-72">
        {children}
      </main>
    </div>
  )
}
