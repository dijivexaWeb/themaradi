import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getTranslation } from '@/i18n/server'
import BrandLogo from '@/components/BrandLogo'
import IdleLogout from '@/components/IdleLogout'
import LangSwitcherDashboard from '@/components/LangSwitcherDashboard'
import Link from 'next/link'
import {
  BookOpen, Camera, Users, MapPin, MessageCircle,
  Settings, LogOut, Eye, ShieldCheck, Headphones, Home,
  Video, Mic, Heart, Palette,
} from 'lucide-react'

export default async function AnmaPaneliLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { t } = await getTranslation()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status, slug, product_type')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const m = t.memorial_panel
  const initial = (profile?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending_verification: { label: m.home.status.pending_verification, cls: 'bg-[#fff4dc] text-[#93620f] border-[#ead4a5]' },
    hidden_vault:         { label: m.home.status.hidden_vault,         cls: 'bg-[#eef1ea] text-[#496056] border-[#dfe6d8]' },
    private_memorial:     { label: m.home.status.private_memorial,     cls: 'bg-[#eef1ea] text-[#174f35] border-[#dfe6d8]' },
    public_memorial:      { label: m.home.status.public_memorial,      cls: 'bg-[#e9f5ec] text-[#176b3f] border-[#cfe7d3]' },
    suspended:            { label: m.home.status.suspended,             cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const status = statusConfig[vault.status ?? 'pending_verification'] ?? statusConfig.pending_verification

  const nav = [
    { href: `/anma-paneli/${id}`,               label: m.sidebar.memorialPage,    icon: Home },
    { href: `/anma-paneli/${id}/biyografi`,     label: m.sidebar.biography,       icon: BookOpen },
    { href: `/anma-paneli/${id}/fotolar`,       label: m.sidebar.photos,          icon: Camera },
    { href: `/anma-paneli/${id}/videolar`,      label: m.sidebar.videos,          icon: Video },
    { href: `/anma-paneli/${id}/anilar`,        label: m.sidebar.memories,        icon: Heart },
    { href: `/anma-paneli/${id}/ses-kayitlari`, label: m.sidebar.audioRecordings, icon: Mic },
    { href: `/anma-paneli/${id}/aile`,          label: m.sidebar.family,          icon: Users },
    { href: `/anma-paneli/${id}/mezar`,         label: m.sidebar.cemetery,        icon: MapPin },
    { href: `/anma-paneli/${id}/taziye`,        label: m.sidebar.guestbook,       icon: MessageCircle },
    { href: `/anma-paneli/${id}/gorunum`,       label: m.sidebar.appearance,      icon: Palette },
    { href: `/anma-paneli/${id}/dogrulama`,     label: m.sidebar.verification,    icon: Settings },
  ]

  return (
    <div className="theme-memorial min-h-screen bg-[#fbf8f0] text-[#173d31]">
      <IdleLogout signoutPath="/auth/signout" redirectPath="/login" />

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 flex-col border-r border-[#e5dccb] bg-[#fffdf7]/95 px-4 py-7 shadow-[18px_0_55px_rgba(64,48,24,0.06)] lg:flex">
        <div className="px-4">
          <BrandLogo href="/" className="text-[#173d31]" />
        </div>

        {/* Anılan kişi kartı */}
        <div className="mt-6 rounded-xl border border-[#e5dccb] bg-[#f9f5ec] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#adb5ab]">{m.sidebar.profileLabel}</p>
          <p className="mt-1 truncate font-serif text-base text-[#173d31]">{vault.display_name}</p>
          <span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Navigasyon */}
        <nav className="mt-5 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[#23382f] transition-all hover:bg-[#f5efdf]"
            >
              <Icon className="h-4 w-4 text-[#7b837d]" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Alt alan */}
        <div className="mt-auto space-y-0.5">
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
            >
              <ShieldCheck className="h-4 w-4" />
              {m.sidebar.adminPanel}
            </Link>
          )}

          {vault.status === 'public_memorial' && vault.slug && (
            <Link
              href={`/memorial/${vault.slug}`}
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#69766f] transition-colors hover:bg-[#f5efdf]"
            >
              <Eye className="h-4 w-4" />
              {m.sidebar.preview}
            </Link>
          )}

          <Link
            href="/contact"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#69766f] transition-colors hover:bg-[#f5efdf]"
          >
            <Headphones className="h-4 w-4" />
            {m.sidebar.helpAndSupport}
          </Link>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#69766f] transition-colors hover:bg-[#f5efdf]"
            >
              <LogOut className="h-4 w-4" />
              {m.sidebar.signOut}
            </button>
          </form>

          <LangSwitcherDashboard />
        </div>

        {/* Kullanıcı bilgisi */}
        <div className="mt-4 rounded-2xl border border-[#e5dccb] bg-white/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174f35] text-sm font-bold text-[#f7df9d]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#21372e]">
                {profile?.full_name ?? m.sidebar.memberLabel}
              </div>
              <div className="truncate text-xs text-[#7b837d]">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBİL HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e5dccb] bg-[#fffdf7]/95 px-4 py-3 backdrop-blur lg:hidden">
        <BrandLogo href={`/anma-paneli/${id}`} className="text-[#173d31]" />
        <div className="flex items-center gap-3">
          <LangSwitcherDashboard className="flex items-center gap-1" />
        </div>
      </header>

      <main className="min-h-screen lg:pl-72">
        {children}
      </main>
    </div>
  )
}
