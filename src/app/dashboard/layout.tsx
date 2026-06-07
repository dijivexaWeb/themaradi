import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const initial = (profile?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Kasalarim',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: '/dashboard/billing',
      label: 'Abonelik',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="theme-admin min-h-screen bg-[#f5f7fb]">
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-white/[0.06] flex flex-col z-40" style={{ background: 'rgba(8, 16, 36, 0.95)' }}>
        {/* Logo */}
        <div className="px-5 h-14 flex items-center border-b border-white/[0.06]">
          <Link href="/" className="font-bold text-lg tracking-tight gradient-text">
            themaradi
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] transition-all group"
            >
              <span className="text-slate-500 group-hover:text-amber-400 transition-colors">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400/30 to-amber-600/20 border border-amber-500/20 flex items-center justify-center text-amber-300 text-xs font-bold shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 truncate">{profile?.full_name ?? 'Kullanici'}</div>
              <div className="text-[11px] text-slate-600 truncate">{user.email}</div>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] rounded-xl transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cikis Yap
            </button>
          </form>
        </div>
      </aside>

      <main className="pl-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
