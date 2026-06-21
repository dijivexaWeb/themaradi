import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getTranslation } from '@/i18n/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen, Camera, Users, MapPin, MessageCircle,
  Settings, ArrowRight, CheckCircle2, Clock, Eye,
} from 'lucide-react'
import { ACTION_ICON_MAP } from '@/lib/memorial-style-templates'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ purchased?: string }>
}

export default async function AnmaPaneliPage({ params, searchParams }: Props) {
  const { id } = await params
  const { purchased } = await searchParams
  const { t } = await getTranslation()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault) notFound()

  const [
    { count: photoCount },
    { count: familyCount },
    { count: pendingGuestbookCount },
    { data: memorialActions },
  ] = await Promise.all([
    supabase.from('media').select('id', { count: 'exact', head: true })
      .eq('vault_id', id).eq('media_type', 'image'),
    supabase.from('vault_family_members').select('id', { count: 'exact', head: true })
      .eq('vault_id', id),
    supabase.from('guestbook_entries').select('id', { count: 'exact', head: true })
      .eq('vault_id', id).eq('status', 'pending'),
    supabase.from('memorial_actions').select('id, label, icon, count')
      .eq('memorial_id', id).eq('is_active', true).order('sort_order', { ascending: true }),
  ])

  const viewCount = (vault as Record<string, unknown>).view_count as number ?? 0
  const totalActionClicks = (memorialActions ?? []).reduce((sum, a) => sum + (a.count ?? 0), 0)

  const m = t.memorial_panel
  const s = m.home.sections
  const isVerified = vault.status === 'public_memorial' || vault.status === 'private_memorial'
  const isPending = vault.status === 'pending_verification'

  const sections = [
    {
      href: `/anma-paneli/${id}/biyografi`,
      icon: BookOpen,
      title: s.biographyTitle,
      filled: !!(vault.biography?.length),
      emptyText: s.biographyEmpty,
      addLabel: s.biographyAdd,
    },
    {
      href: `/anma-paneli/${id}/fotolar`,
      icon: Camera,
      title: s.photosTitle,
      filled: (photoCount ?? 0) > 0,
      count: photoCount ?? 0,
      emptyText: s.photosEmpty,
      addLabel: s.photosAdd,
    },
    {
      href: `/anma-paneli/${id}/aile`,
      icon: Users,
      title: s.familyTitle,
      filled: (familyCount ?? 0) > 0,
      count: familyCount ?? 0,
      emptyText: s.familyEmpty,
      addLabel: s.familyAdd,
    },
    {
      href: `/anma-paneli/${id}/mezar`,
      icon: MapPin,
      title: s.cemeteryTitle,
      filled: !!(vault.cemetery_name || vault.cemetery_lat),
      emptyText: s.cemeteryEmpty,
      addLabel: s.cemeteryAdd,
    },
    {
      href: `/anma-paneli/${id}/taziye`,
      icon: MessageCircle,
      title: s.guestbookTitle,
      filled: true,
      badge: (pendingGuestbookCount ?? 0) > 0 ? pendingGuestbookCount : null,
      managedLabel: s.guestbookManage,
      emptyText: s.guestbookEmpty,
      addLabel: s.guestbookManage,
    },
    {
      href: `/anma-paneli/${id}/dogrulama`,
      icon: Settings,
      title: s.verificationTitle,
      filled: isVerified,
      emptyText: s.verificationPending,
      addLabel: s.verificationStart,
      isVerification: true,
    },
  ]

  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <div className="relative overflow-hidden bg-[#1c2e25]">
        {vault.cover_photo_url && (
          <div className="absolute inset-0">
            <Image src={vault.cover_photo_url} alt="" fill className="object-cover opacity-10" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1c2e25]/60 via-[#1c2e25]/80 to-[#1c2e25]" />
          </div>
        )}

        <div className="relative px-6 py-8 sm:px-10">
          {/* Bannerlar */}
          {purchased && (
            <div className="mb-4 rounded-xl border border-[#dfbd72]/40 bg-[#dfbd72]/10 px-4 py-3 text-xs text-[#dfbd72]">
              {m.home.purchasedBanner}
            </div>
          )}
          {isPending && !purchased && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {m.home.pendingBanner}
            </div>
          )}

          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-[#2a4035] shadow-xl">
              {vault.cover_photo_url ? (
                <Image src={vault.cover_photo_url} alt={vault.display_name} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-3xl text-[#dfbd72]">
                  {vault.display_name[0]}
                </div>
              )}
            </div>

            {/* İsim + bilgi */}
            <div className="min-w-0 flex-1 pt-1">
              <h1 className="font-serif text-2xl font-semibold text-white leading-tight">{vault.display_name}</h1>
              {(birthYear || deathYear) && (
                <p className="mt-1 text-sm text-white/50">
                  {birthYear ?? '?'} – {deathYear ?? '...'}
                </p>
              )}
              {vault.tagline && (
                <p className="mt-2 text-sm italic text-white/40 leading-relaxed">&ldquo;{vault.tagline}&rdquo;</p>
              )}
            </div>

            {/* Butonlar */}
            <div className="hidden shrink-0 flex-col gap-2 sm:flex">
              {vault.slug && (
                <Link
                  href={isVerified ? `/memorial/${vault.slug}` : `/memorial/${vault.slug}?preview=1`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {isVerified ? m.home.viewPublicPage : m.sidebar.previewDraft}
                </Link>
              )}
              {isPending && (
                <Link
                  href={`/anma-paneli/${id}/dogrulama`}
                  className="flex items-center gap-2 rounded-xl bg-[#dfbd72] px-4 py-2 text-xs font-semibold text-[#1c2e25] shadow-lg transition hover:bg-[#e8cc82]"
                >
                  {m.home.startVerification}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Stats bar — sadece yayında */}
          {isVerified && (
            <div className="mt-6 flex items-center gap-6 border-t border-white/10 pt-5">
              <div className="text-center">
                <div className="font-serif text-xl font-semibold text-white">{viewCount.toLocaleString('tr-TR')}</div>
                <div className="text-[11px] text-white/40 mt-0.5">Ziyaret</div>
              </div>
              {(memorialActions?.length ?? 0) > 0 && (
                <div className="text-center">
                  <div className="font-serif text-xl font-semibold text-white">{totalActionClicks.toLocaleString('tr-TR')}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">Anma aksiyonu</div>
                </div>
              )}
              {(memorialActions ?? []).map(action => (
                <div key={action.id} className="text-center">
                  <div className="font-serif text-xl font-semibold text-white">{(action.count ?? 0).toLocaleString('tr-TR')}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{action.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BÖLÜM GRİDİ */}
      <div className="px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl">

          {/* Mobil CTA */}
          {isPending && (
            <Link
              href={`/anma-paneli/${id}/dogrulama`}
              className="mb-4 flex sm:hidden items-center justify-between gap-3 rounded-2xl bg-[#174f35] px-5 py-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(23,79,53,0.2)]"
            >
              {m.home.startVerification}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map(({ href, icon: Icon, title, filled, count, badge, emptyText, addLabel, isVerification }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-2xl border border-[#e5dccb] bg-white p-5 shadow-[0_2px_12px_rgba(64,48,24,0.04)] transition-all hover:border-[#174f35]/30 hover:shadow-[0_6px_28px_rgba(23,79,53,0.1)]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  filled
                    ? 'bg-[#174f35] text-white'
                    : 'border border-[#e5dccb] bg-[#f9f5ec] text-[#b08340]'
                }`}>
                  {isVerification && filled ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1f2d27]">{title}</span>
                    {badge != null && (badge as number) > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                    {typeof count === 'number' && count > 0 && (
                      <span className="text-xs text-[#adb5ab]">{count}</span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-xs leading-5 ${filled ? 'text-[#174f35]/70' : 'text-[#b08340]'}`}>
                    {filled ? addLabel : emptyText}
                  </p>
                </div>

                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#d5cec4] transition-transform group-hover:translate-x-0.5 group-hover:text-[#174f35]" />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
