import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  Eye, Users, BookOpen, MessageCircle, ImageIcon, Video,
  UserRound, Mic, QrCode, Settings, ChevronRight, Plus,
} from 'lucide-react'
import { getTranslation } from '@/i18n/server'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ purchased?: string }>
}

const REL_ICONS: Record<string, string> = {
  mother: '👩', father: '👨', spouse: '💑', son: '👦',
  daughter: '👧', sibling: '🧑', grandparent: '👴', grandchild: '🧒', other: '👤',
}

export default async function MemoryAreaPage({ params, searchParams }: Props) {
  const { lang, t } = await getTranslation()
  const { id } = await params
  const { purchased } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: area } = await supabase
    .from('vaults').select('*')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!area) notFound()

  const [
    { data: familyMembers, count: familyCount },
    { data: recentMemories, count: memoriesCount },
    { data: recentPhotos, count: photoCount },
    { data: recentVideos, count: videoCount },
    { data: linkedQRs },
    { data: recentAudio, count: audioCount },
    { count: pendingGuestbookCount },
  ] = await Promise.all([
    supabase.from('vault_family_members')
      .select('id, full_name, relationship, photo_url', { count: 'exact' })
      .eq('vault_id', id).order('sort_order', { ascending: true }).limit(5),
    supabase.from('vault_memories')
      .select('id, title, content, memory_date', { count: 'exact' })
      .eq('vault_id', id).eq('is_secret', false)
      .order('memory_date', { ascending: false }).limit(3),
    supabase.from('media')
      .select('id, thumb_url, original_url', { count: 'exact' })
      .eq('vault_id', id).eq('media_type', 'image')
      .order('sort_order', { ascending: true }).limit(6),
    supabase.from('media')
      .select('id, original_url, original_filename, taken_at', { count: 'exact' })
      .eq('vault_id', id).eq('media_type', 'video')
      .order('sort_order', { ascending: true }).limit(3),
    supabase.from('dynamic_qr').select('qr_hash').eq('target_vault_id', id),
    supabase.from('vault_audio_recordings').select('id, title, author', { count: 'exact' }).eq('vault_id', id).order('sort_order').limit(3),
    supabase.from('guestbook_entries').select('id', { count: 'exact' }).eq('vault_id', id).eq('status', 'pending'),
  ])

  const isLocked = area.status === 'pending_verification'
  const isMemorial = area.product_type === 'memorial_profile'
  const qrActive = (linkedQRs?.length ?? 0) > 0

  const birthYear = area.birth_date ? new Date(area.birth_date).getFullYear() : null
  const deathYear = area.death_date ? new Date(area.death_date).getFullYear() : null

  const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
    pending_verification: { label: t.dashboard.vault.statusPendingVerification, dot: 'bg-amber-400', text: 'text-amber-700' },
    hidden_vault:         { label: t.dashboard.vault.statusHiddenVault,          dot: 'bg-slate-400',  text: 'text-slate-600'  },
    private_memorial:     { label: t.dashboard.vault.statusPrivateMemorial,      dot: 'bg-teal-500',   text: 'text-teal-700'  },
    public_memorial:      { label: t.dashboard.vault.statusPublicMemorial,       dot: 'bg-emerald-500',text: 'text-emerald-700'},
    suspended:            { label: t.dashboard.vault.statusSuspended,            dot: 'bg-red-500',    text: 'text-red-700'   },
  }
  const status = statusConfig[area.status ?? 'hidden_vault'] ?? statusConfig.hidden_vault

  // Tamamlanma skoru
  const completionItems = [
    { done: !!(area.cover_photo_url), label: 'Profil fotoğrafı' },
    { done: !!(area.biography?.length), label: 'Biyografi' },
    { done: (photoCount ?? 0) > 0, label: 'Fotoğraf' },
    { done: (familyCount ?? 0) > 0, label: 'Aile bağları' },
    { done: (memoriesCount ?? 0) > 0, label: 'Anı' },
    { done: (audioCount ?? 0) > 0, label: 'Ses kaydı' },
  ]
  const doneCount = completionItems.filter(i => i.done).length
  const completionPct = Math.round((doneCount / completionItems.length) * 100)

  const dateLocale = lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'tr-TR'

  const v = (path: string) => `/dashboard/vault/${id}/${path}`

  return (
    <div className="min-h-screen bg-[#fbf8f0] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-5">

        {/* ── Bildirimler ── */}
        {purchased && (
          <div className="rounded-2xl border border-[#dfbd72]/40 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            {t.dashboard.vault.purchasedMessage}
          </div>
        )}
        {isLocked && (
          <div className="rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            {t.dashboard.vault.lockedMessage}
          </div>
        )}

        {/* ── HERO ── */}
        <div className="relative overflow-hidden rounded-3xl border border-[#e5dccb] bg-[#1c2e25] shadow-xl">
          {/* Arka plan — cover foto varsa göster */}
          {area.cover_photo_url && (
            <div className="absolute inset-0">
              <Image src={area.cover_photo_url} alt="" fill className="object-cover opacity-20" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1c2e25]/95 via-[#1c2e25]/80 to-transparent" />
            </div>
          )}

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8">
            {/* Avatar */}
            <div className="relative h-24 w-24 shrink-0 rounded-2xl border-2 border-[#dfbd72]/60 bg-[#2a4035] overflow-hidden shadow-lg">
              {area.cover_photo_url ? (
                <Image src={area.cover_photo_url} alt={area.display_name} fill className="object-cover" unoptimized />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-serif text-3xl text-[#dfbd72]">
                  {area.display_name[0]}
                </div>
              )}
            </div>

            {/* Bilgiler */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/80`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
                <span className="rounded-full border border-[#dfbd72]/30 bg-[#dfbd72]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#dfbd72]">
                  {isMemorial ? t.dashboard.vault.productMemorialProfile : t.dashboard.vault.productLifeVault}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl text-white leading-tight">{area.display_name}</h1>

              {(birthYear || deathYear) && (
                <p className="mt-1 font-serif text-sm text-white/50">{birthYear ?? '?'} – {deathYear ?? '...'}</p>
              )}
              {area.tagline && (
                <p className="mt-1.5 text-sm italic text-white/50">&quot;{area.tagline}&quot;</p>
              )}
            </div>

            {/* Sağ aksiyon butonları */}
            <div className="flex flex-col gap-2 shrink-0">
              <Link href={`/preview/${id}`} target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-medium text-white/80 transition-colors">
                <Eye className="h-3.5 w-3.5" />
                {t.dashboard.vault.preview}
              </Link>
              <Link href={v('profil')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfbd72]/30 bg-[#dfbd72]/10 hover:bg-[#dfbd72]/20 px-4 py-2 text-xs font-medium text-[#dfbd72] transition-colors">
                <Settings className="h-3.5 w-3.5" />
                {t.dashboard.vault.edit}
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative border-t border-white/10 grid grid-cols-4 divide-x divide-white/10">
            {[
              { label: t.dashboard.vault.photos,          value: photoCount ?? 0,    href: v('fotolar'),      icon: ImageIcon },
              { label: t.dashboard.vault.memories,        value: memoriesCount ?? 0, href: v('anilar'),       icon: MessageCircle },
              { label: t.dashboard.vault.familyBonds,     value: familyCount ?? 0,   href: v('aile'),         icon: Users },
              { label: t.dashboard.vault.audioRecordings, value: audioCount ?? 0,    href: v('ses-kayitlari'),icon: Mic },
            ].map(({ label, value, href, icon: Icon }) => (
              <Link key={label} href={href}
                className="flex flex-col items-center gap-0.5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-xl font-bold text-white">{value}</span>
                <span className="text-[10px] text-white/40 hidden sm:block">{label}</span>
                <Icon className="h-3 w-3 text-white/30 sm:hidden" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Tamamlanma barı ── */}
        <div className="rounded-2xl border border-[#e5dccb] bg-white px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#4a5e55]">Profil tamamlanma</span>
            <span className="text-xs font-bold text-[#174f35]">%{completionPct}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#f0ebe0] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#174f35] transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
            {completionItems.map(item => (
              <span key={item.label} className={`text-[11px] flex items-center gap-1 ${item.done ? 'text-[#174f35]' : 'text-[#c8bfb0]'}`}>
                <span>{item.done ? '✓' : '○'}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── 2 kolon grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* SOL: Biyografi */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#b08340]" />
                <span className="text-sm font-semibold text-[#1f2d27]">{t.dashboard.vault.lifeStory}</span>
              </div>
              <Link href={v('biography')} className="text-xs font-medium text-[#174f35] hover:underline flex items-center gap-0.5">
                {(area.biography?.length ?? 0) > 0 ? t.dashboard.vault.edit : t.dashboard.vault.writeStory}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {(area.biography?.length ?? 0) > 0 ? (
              <div className="p-5">
                <p className="text-sm text-[#4a5e55] leading-7 line-clamp-5">{area.biography}</p>
                <p className="mt-2 text-xs text-[#c8bfb0]">{area.biography!.length} {t.dashboard.vault.charsVisibleOnMemorial}</p>
              </div>
            ) : (
              <div className="p-5">
                <div className="space-y-2 mb-3">
                  {[100, 80, 95, 65].map((w, i) => (
                    <div key={i} className="h-3 rounded-full bg-[#f5f0e8]" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <p className="text-xs text-[#c8bfb0]">{t.dashboard.vault.biographyEmptyText}</p>
              </div>
            )}
          </div>

          {/* SAĞ: Fotoğraflar */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#b08340]" />
                <span className="text-sm font-semibold text-[#1f2d27]">{t.dashboard.vault.photos}</span>
                {(photoCount ?? 0) > 0 && (
                  <span className="text-xs text-[#c8bfb0]">{photoCount}</span>
                )}
              </div>
              <Link href={v('fotolar')} className="text-xs font-medium text-[#174f35] hover:underline flex items-center gap-0.5">
                {(photoCount ?? 0) > 0 ? t.dashboard.vault.edit : t.dashboard.vault.addPhoto}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {(photoCount ?? 0) > 0 ? (
              <div className="p-3 grid grid-cols-3 gap-1.5">
                {recentPhotos?.map((p) => (
                  <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-[#f5f0e8]">
                    <Image
                      src={p.thumb_url ?? p.original_url}
                      alt=""
                      width={120} height={120}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                ))}
                {(photoCount ?? 0) > 6 && (
                  <Link href={v('fotolar')} className="aspect-square rounded-xl bg-[#f5f0e8] flex items-center justify-center text-xs font-bold text-[#788177]">
                    +{(photoCount ?? 0) - 6}
                  </Link>
                )}
              </div>
            ) : (
              <div className="p-3 grid grid-cols-3 gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-[#f5f0e8] flex items-center justify-center">
                    {i === 0 && <Plus className="h-5 w-5 text-[#c8bfb0]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SOL: Anılar */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#b08340]" />
                <span className="text-sm font-semibold text-[#1f2d27]">{t.dashboard.vault.memories}</span>
                {(memoriesCount ?? 0) > 0 && (
                  <span className="text-xs text-[#c8bfb0]">{memoriesCount}</span>
                )}
              </div>
              <Link href={v('anilar')} className="text-xs font-medium text-[#174f35] hover:underline flex items-center gap-0.5">
                {(memoriesCount ?? 0) > 0 ? t.dashboard.vault.edit : t.dashboard.vault.addMemory}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {(memoriesCount ?? 0) > 0 ? (
              <div className="divide-y divide-[#f5f0e8]">
                {recentMemories?.map((m) => (
                  <div key={m.id} className="px-5 py-3.5">
                    {m.memory_date && (
                      <p className="text-[10px] font-semibold text-[#dfbd72] tracking-wide mb-0.5">
                        {new Date(m.memory_date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long' })}
                      </p>
                    )}
                    {m.title && <p className="text-sm font-semibold text-[#1f2d27] mb-0.5">{m.title}</p>}
                    <p className="text-xs text-[#788177] leading-5 line-clamp-2">{m.content}</p>
                  </div>
                ))}
                {(memoriesCount ?? 0) > 3 && (
                  <div className="px-5 py-3">
                    <Link href={v('anilar')} className="text-xs text-[#174f35] font-medium hover:underline">
                      {t.dashboard.vault.seeAllMemories.replace('{count}', String(memoriesCount))} →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#f5f0e8]">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="px-5 py-3.5 space-y-1.5">
                    <div className="h-2 w-20 rounded-full bg-[#f5f0e8]" />
                    <div className="h-3 w-full rounded-full bg-[#f5f0e8]" />
                    <div className="h-3 w-2/3 rounded-full bg-[#f5f0e8]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: Aile bağları */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#b08340]" />
                <span className="text-sm font-semibold text-[#1f2d27]">{t.dashboard.vault.familyBonds}</span>
                {(familyCount ?? 0) > 0 && (
                  <span className="text-xs text-[#c8bfb0]">{familyCount} {familyCount === 1 ? t.dashboard.vault.personCount : t.dashboard.vault.peopleCount}</span>
                )}
              </div>
              <Link href={v('aile')} className="text-xs font-medium text-[#174f35] hover:underline flex items-center gap-0.5">
                {(familyCount ?? 0) > 0 ? t.dashboard.vault.edit : t.dashboard.vault.addFamily}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4">
              {(familyCount ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {familyMembers?.map((m) => (
                    <div key={m.id} className="flex flex-col items-center gap-1.5 w-14">
                      <div className="relative h-12 w-12 rounded-full border-2 border-[#e5dccb] bg-[#f5efdf] overflow-hidden">
                        {m.photo_url ? (
                          <Image src={m.photo_url} alt={m.full_name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xl">
                            {REL_ICONS[m.relationship] ?? '👤'}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-[#4a5e55] font-medium text-center leading-tight line-clamp-2">{m.full_name.split(' ')[0]}</p>
                    </div>
                  ))}
                  {(familyCount ?? 0) > 5 && (
                    <div className="flex flex-col items-center gap-1.5 w-14">
                      <Link href={v('aile')} className="h-12 w-12 rounded-full border-2 border-dashed border-[#e5dccb] bg-[#f5efdf] flex items-center justify-center text-xs font-bold text-[#788177]">
                        +{(familyCount ?? 0) - 5}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 w-14">
                      <div className="h-12 w-12 rounded-full bg-[#f5f0e8]" />
                      <div className="h-2 w-10 rounded-full bg-[#f5f0e8]" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Alt satır: Ses + Taziye + QR ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Ses kayıtları */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2">
                <Mic className="h-3.5 w-3.5 text-[#b08340]" />
                <span className="text-xs font-semibold text-[#1f2d27]">{t.dashboard.vault.audioRecordings}</span>
              </div>
              <Link href={v('ses-kayitlari')} className="text-[11px] text-[#174f35] hover:underline">
                {(audioCount ?? 0) > 0 ? `${audioCount} kayıt` : '+ Ekle'}
              </Link>
            </div>
            <div className="p-3 space-y-1.5">
              {(audioCount ?? 0) > 0 ? recentAudio?.slice(0, 2).map((rec) => (
                <div key={rec.id} className="flex items-center gap-2.5 rounded-xl bg-[#f9f6ef] px-3 py-2">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-[#174f35]/10 flex items-center justify-center">
                    <Mic className="h-3 w-3 text-[#174f35]" />
                  </div>
                  <p className="truncate text-xs font-medium text-[#1f2d27]">{rec.title}</p>
                </div>
              )) : (
                <div className="flex items-center gap-2 rounded-xl bg-[#f9f6ef] px-3 py-2.5">
                  <Mic className="h-3.5 w-3.5 text-[#c8bfb0]" />
                  <p className="text-xs text-[#c8bfb0]">Henüz ses kaydı yok</p>
                </div>
              )}
            </div>
          </div>

          {/* Ziyaretçi defteri */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🕊️</span>
                <span className="text-xs font-semibold text-[#1f2d27]">{t.dashboard.vault.guestbook}</span>
              </div>
              <Link href={v('taziye-defteri')} className="text-[11px] text-[#174f35] hover:underline">
                {(pendingGuestbookCount ?? 0) > 0 ? `${pendingGuestbookCount} bekliyor` : t.dashboard.vault.manage}
              </Link>
            </div>
            <div className="p-3">
              {(pendingGuestbookCount ?? 0) > 0 ? (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                    {pendingGuestbookCount}
                  </span>
                  <p className="text-xs text-amber-700">{t.dashboard.vault.pendingGuestbookMessages}</p>
                </div>
              ) : (
                <p className="text-xs text-[#c8bfb0] px-1 py-1.5">{t.dashboard.vault.approveGuestbookMessages}</p>
              )}
            </div>
          </div>

          {/* QR & Adres */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2">
                <QrCode className="h-3.5 w-3.5 text-[#b08340]" />
                <span className="text-xs font-semibold text-[#1f2d27]">QR & Adres</span>
              </div>
              <Link href={v('settings')} className="text-[11px] text-[#174f35] hover:underline">
                {t.dashboard.vault.editSettings}
              </Link>
            </div>
            <div className="p-3 space-y-1.5">
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${qrActive ? 'bg-emerald-50 border border-emerald-100' : 'bg-[#f9f6ef]'}`}>
                <span className={`h-2 w-2 rounded-full shrink-0 ${qrActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <p className="text-xs font-medium text-[#4a5e55]">
                  {qrActive ? t.dashboard.vault.qrActive : 'QR bağlı değil'}
                </p>
              </div>
              {area.slug && (
                <div className="flex items-center gap-1.5 px-1">
                  <Link href={`/memorial/${area.slug}`} target="_blank"
                    className="text-[11px] text-[#174f35] truncate hover:underline">
                    /memorial/{area.slug}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
