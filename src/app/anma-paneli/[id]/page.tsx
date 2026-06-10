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

  const blockCls = 'rounded-2xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_2px_16px_rgba(64,48,24,0.05)]'

  return (
    <div className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Satın alma sonrası banner */}
        {purchased && (
          <div className="mb-4 rounded-2xl border border-[#dfbd72]/40 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            {m.home.purchasedBanner}
          </div>
        )}

        {/* Doğrulama bekleniyor banner */}
        {isPending && !purchased && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#dfbd72]/40 bg-[#fff7e6] px-5 py-4">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#b08340]" />
            <p className="text-sm text-[#725212]">{m.home.pendingBanner}</p>
          </div>
        )}

        {/* Profil başlığı */}
        <div className={`${blockCls} mb-4 overflow-hidden`}>
          <div className="flex items-center gap-5 p-6">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#dfbd72] bg-[#f8efd8] shadow-md">
              {vault.cover_photo_url ? (
                <Image
                  src={vault.cover_photo_url}
                  alt={vault.display_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="font-serif text-3xl text-[#b08340]">
                  {vault.display_name[0]}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl text-[#1f2d27]">{vault.display_name}</h1>
              {(vault.birth_date || vault.death_date) && (
                <p className="mt-0.5 font-serif text-sm text-[#788177]">
                  {vault.birth_date ? new Date(vault.birth_date).getFullYear() : '?'}
                  {' – '}
                  {vault.death_date ? new Date(vault.death_date).getFullYear() : '...'}
                </p>
              )}
              {vault.tagline && (
                <p className="mt-1 text-sm italic text-[#7a7467]">&quot;{vault.tagline}&quot;</p>
              )}
            </div>
            {isVerified && vault.slug && (
              <Link
                href={`/memorial/${vault.slug}`}
                target="_blank"
                className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#173d31] transition hover:bg-[#f4eee3] sm:flex"
              >
                {m.home.viewPublicPage}
              </Link>
            )}
          </div>

          {/* Doğrulama CTA */}
          {isPending && (
            <div className="border-t border-[#f0ebe0] bg-[#fffbf0] px-6 py-3 flex items-center justify-between">
              <p className="text-xs text-[#725212]">{s.verificationPending}</p>
              <Link
                href={`/anma-paneli/${id}/dogrulama`}
                className="flex items-center gap-1.5 rounded-xl bg-[#174f35] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(23,79,53,0.2)] hover:bg-[#123f2b] transition-colors"
              >
                {m.home.startVerification}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* İstatistik kartları — sadece yayınlanmış sayfalarda */}
        {isVerified && (
          <div className={`mb-4 grid gap-3 ${(memorialActions?.length ?? 0) > 0 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {/* Ziyaretçi sayısı */}
            <div className={`${blockCls} flex items-center gap-4 p-5`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#c7a76f]/30 bg-[#f9f5ec]">
                <Eye className="h-5 w-5 text-[#b08340]" />
              </div>
              <div>
                <div className="font-serif text-2xl text-[#1f2d27]">{viewCount.toLocaleString('tr-TR')}</div>
                <div className="text-xs text-[#788177]">Sayfa ziyareti</div>
              </div>
            </div>

            {/* Toplam aksiyon */}
            {(memorialActions?.length ?? 0) > 0 && (
              <div className={`${blockCls} flex items-center gap-4 p-5`}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#c7a76f]/30 bg-[#f9f5ec] text-xl">
                  {ACTION_ICON_MAP[memorialActions![0].icon as keyof typeof ACTION_ICON_MAP] ?? memorialActions![0].icon}
                </div>
                <div>
                  <div className="font-serif text-2xl text-[#1f2d27]">{totalActionClicks.toLocaleString('tr-TR')}</div>
                  <div className="text-xs text-[#788177]">Toplam anma aksiyonu</div>
                </div>
              </div>
            )}

            {/* Her aksiyon ayrı */}
            {(memorialActions ?? []).map(action => (
              <div key={action.id} className={`${blockCls} flex items-center gap-4 p-5`}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#c7a76f]/30 bg-[#f9f5ec] text-xl">
                  {ACTION_ICON_MAP[action.icon as keyof typeof ACTION_ICON_MAP] ?? action.icon}
                </div>
                <div>
                  <div className="font-serif text-2xl text-[#1f2d27]">{(action.count ?? 0).toLocaleString('tr-TR')}</div>
                  <div className="text-xs text-[#788177]">{action.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bölüm kartları */}
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map(({ href, icon: Icon, title, filled, count, badge, emptyText, addLabel, isVerification }) => (
            <Link
              key={href}
              href={href}
              className={`${blockCls} group flex items-start gap-4 p-5 transition-all hover:border-[#c7a76f] hover:shadow-[0_4px_24px_rgba(64,48,24,0.1)]`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                filled
                  ? 'border-[#174f35]/20 bg-[#174f35]/8 text-[#174f35]'
                  : 'border-[#e5dccb] bg-[#f9f5ec] text-[#b08340]'
              }`}>
                {isVerification && filled ? (
                  <CheckCircle2 className="h-5 w-5 text-[#174f35]" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1f2d27]">{title}</span>
                  {badge != null && (badge as number) > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c7a76f] text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                  {typeof count === 'number' && count > 0 && (
                    <span className="text-xs text-[#adb5ab]">{count}</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#788177] leading-5">
                  {filled ? addLabel : emptyText}
                </p>
              </div>

              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#c8bfb0] transition-colors group-hover:text-[#b08340]" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
