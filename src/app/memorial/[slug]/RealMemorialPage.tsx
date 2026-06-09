import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Clock, Feather, Heart, MapPin, Navigation, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas'
import AudioPlayerSection from './AudioPlayerSection'
import RealMemorialInteractionsWrapper from './RealMemorialInteractionsWrapper'
import TimelineSection from './TimelineSection'
import { getTurnstileSiteKey } from '@/lib/turnstile'

interface VaultRow {
  id: string
  display_name: string
  tagline: string | null
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
  birth_place: string | null
  death_place: string | null
  biography: string | null
  profession: string | null
  hobbies: string | null
  favorite_song_title: string | null
  favorite_song_url: string | null
  donation_preference: string | null
  last_message: string | null
  cemetery_name: string | null
  cemetery_address: string | null
  product_type: string
  status: string
  pub_settings: Record<string, boolean> | null
}

interface Props {
  vault: VaultRow
  isPreview?: boolean
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getVideoEmbed(url: string): string | null {
  const yt = getYouTubeId(url)
  if (yt) return `https://www.youtube.com/embed/${yt}`
  const vim = url.match(/vimeo\.com\/(\d+)/)
  if (vim) return `https://player.vimeo.com/video/${vim[1]}`
  return null
}

function getVideoThumb(url: string, fallback?: string | null): string | null {
  const ytId = getYouTubeId(url)
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
  return fallback ?? null
}

export default async function RealMemorialPage({ vault, isPreview = false }: Props) {
  const id = vault.id
  const supabase = await createClient()

  const v = vault as unknown as Record<string, unknown>

  const [
    { data: photos },
    { data: videos },
    { data: allMemories },
    { data: familyMembers },
    { data: audioRecordings },
    guestbookResult,
    reactionsResult,
  ] = await Promise.all([
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'image').eq('is_public', true).order('sort_order', { ascending: true }).limit(24),
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'video').eq('is_public', true).order('sort_order', { ascending: true }).limit(6),
    supabase.from('vault_memories').select('*').eq('vault_id', id).eq('is_secret', false).order('memory_date', { ascending: true }),
    supabase.from('vault_family_members').select('*').eq('vault_id', id).order('sort_order'),
    supabase.from('vault_audio_recordings').select('*').eq('vault_id', id).eq('is_public', true).order('sort_order'),
    supabase.from('guestbook_entries').select('*').eq('vault_id', id).eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
    supabase.from('memorial_reactions').select('reaction_type').eq('vault_id', id),
  ])

  const guestbookEntries = (guestbookResult.data ?? []) as {
    id: string
    author_name: string
    relation: string | null
    message: string
    created_at: string
  }[]

  const reactionData = (reactionsResult.data ?? []) as { reaction_type: string }[]
  const initialCounts = {
    candle: reactionData.filter((r) => r.reaction_type === 'candle').length,
    flower: reactionData.filter((r) => r.reaction_type === 'flower').length,
    prayer: reactionData.filter((r) => r.reaction_type === 'prayer').length,
  }

  const turnstileSiteKey = await getTurnstileSiteKey()

  const timelineMemories = allMemories?.filter((m) => m.section === 'kronoloji') ?? []
  const featuredMemories = allMemories?.filter((m) => m.section === 'featured') ?? []
  const regularMemories = allMemories?.filter((m) => !m.section || m.section === 'genel' || m.section === 'general') ?? []

  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null
  const yearsLived = birthYear && deathYear ? deathYear - birthYear : null
  const currentTime = new Date().getTime()
  const daysSince = vault.death_date
    ? Math.floor((currentTime - new Date(vault.death_date).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const vaultInitial = vault.display_name?.[0]?.toUpperCase() ?? '?'

  const hasFamilyMembers = (familyMembers?.length ?? 0) > 0
  const hasPhotos = (photos?.length ?? 0) > 0
  const hasVideos = (videos?.length ?? 0) > 0
  const hasAudio = (audioRecordings?.length ?? 0) > 0
  const hasTimeline = timelineMemories.length > 0
  const hasFeatured = featuredMemories.length > 0
  const hasRegularMemories = regularMemories.length > 0
  const hasCemetery = !!vault.cemetery_name
  const hasPersonalDetails = !!vault.profession || !!vault.hobbies
  const hasFavoriteSong = !!vault.favorite_song_url
  const hasDonationPreference = !!vault.donation_preference
  const hasStory = !!vault.biography || hasPersonalDetails || hasFavoriteSong || hasDonationPreference

  const heroBgUrl = v.hero_bg_url as string | null | undefined

  const tabs = [
    { href: '#hikaye', label: 'Hayat Hikayesi', show: hasStory },
    { href: '#kronoloji', label: 'Kronoloji', show: hasTimeline },
    { href: '#videolar', label: 'Videolar', show: hasVideos },
    { href: '#fotograflar', label: 'Fotoğraflar', show: hasPhotos },
    { href: '#son-mesaj', label: 'Son Mesaj', show: !!vault.last_message },
    { href: '#anilar', label: 'Anılar', show: hasRegularMemories },
    { href: '#taziye', label: 'Taziye', show: true },
    { href: '#ziyaret', label: 'Ziyaret', show: hasCemetery },
  ].filter((t) => t.show)

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">

      {/* ── Preview banner ── */}
      {isPreview && (
        <div className="bg-[#c7a76f] px-4 py-2 text-center text-xs font-semibold text-[#091712]">
          Önizleme Modu — Bu sayfa henüz yayınlanmamış
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-[#e6dccb]/50 bg-[#fbf8f1]/96 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="text-xs text-[#8a7a64]">Dijital Anma Profili</div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0c3327]">
        {heroBgUrl ? (
          <Image
            src={heroBgUrl}
            alt="Arka plan"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-35"
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/images/landing/memorial-cemetery.png')] bg-cover bg-center opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c3327] via-[#0c3327]/85 to-[#0c3327]/20" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-5 px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-[1fr_380px_1fr] lg:gap-10 lg:py-20">

          {/* Left — Ailesinden */}
          <div className="order-2 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6 lg:order-1">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.22em] uppercase">Ailesinden</span>
            </div>
            <p className="font-serif text-lg leading-8 text-white sm:text-xl sm:leading-9">
              {vault.tagline ?? 'Saygıyla anıyoruz. Bize bıraktığı sevgi ve hatıralar her zaman kalbimizde yaşayacak.'}
            </p>
            <a
              href="#taziye"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c7a76f] px-4 py-2.5 text-xs font-semibold text-[#0c3327] transition hover:bg-[#d4b87c]"
            >
              Anı Defteri <PenLine className="h-4 w-4" />
            </a>
          </div>

          {/* Center — Portrait */}
          <div className="order-1 text-center lg:order-2">
            <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.25em] uppercase">Dijital Anıt Profili</span>
              <span className="h-px w-8 bg-[#c7a76f]" />
            </div>

            {vault.cover_photo_url ? (
              <div className="relative mx-auto h-[210px] w-[210px] overflow-hidden rounded-full border-[5px] border-[#c7a76f]/35 bg-[#0c3327] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:h-[310px] sm:w-[310px] sm:border-[6px]">
                <Image src={vault.cover_photo_url} alt={vault.display_name} fill priority sizes="310px" className="object-cover object-top" unoptimized />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
              </div>
            ) : (
              <div className="mx-auto flex h-[210px] w-[210px] items-center justify-center rounded-full border-[5px] border-[#c7a76f]/35 bg-[#091712] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:h-[310px] sm:w-[310px]">
                <span className="text-7xl font-bold text-[#c7a76f]/40">{vaultInitial}</span>
              </div>
            )}

            <h1 className="mt-5 font-serif text-4xl leading-none text-white sm:mt-7 sm:text-6xl">
              {vault.display_name}
            </h1>
            <div className="mt-3 flex items-center justify-center gap-4 font-serif text-lg text-[#efe7d8]/80 sm:text-xl">
              <span>{birthYear ?? '?'}</span>
              <Feather className="h-4 w-4 text-[#c7a76f]" />
              <span>{deathYear ?? '?'}</span>
            </div>
            {vault.birth_place && (
              <p className="mx-auto mt-2 max-w-xs font-serif text-sm italic leading-6 text-[#cfc3ad]">
                📍 {vault.birth_place}
              </p>
            )}
            {vault.profession && (
              <p className="mx-auto mt-2 max-w-xs text-xs font-semibold uppercase tracking-[0.18em] text-[#c7a76f]">
                {vault.profession}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6">
              {yearsLived !== null && (
                <div className="rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-3 backdrop-blur-sm">
                  <div className="font-serif text-2xl text-white sm:text-3xl">{yearsLived}</div>
                  <div className="mt-1 text-xs text-[#c7a76f]">yıl</div>
                </div>
              )}
              {daysSince !== null && (
                <div className="rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-3 backdrop-blur-sm">
                  <div className="font-serif text-2xl text-white sm:text-3xl">{daysSince.toLocaleString('tr-TR')}</div>
                  <div className="mt-1 text-xs text-[#c7a76f]">gün oldu</div>
                </div>
              )}
            </div>
            {daysSince !== null && (
              <div className="mt-3 rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#c7a76f] backdrop-blur-sm">
                Ebediyete yürüyeli
              </div>
            )}
          </div>

          {/* Right — Son Mesaj */}
          <div className="order-3 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.22em] uppercase">Ondan kalan söz</span>
            </div>
            <div className="font-serif text-5xl leading-none text-[#c7a76f]/35">&ldquo;</div>
            <p className="mt-1 font-serif text-lg italic leading-8 text-white sm:text-xl sm:leading-9">
              {vault.last_message ?? 'Bu kişi için henüz bir son mesaj eklenmemiş.'}
            </p>
            <a
              href="#son-mesaj"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#c7a76f]/40 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Anıları Keşfet <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <span className="text-[10px] tracking-[0.2em] text-[#c7a76f]/50 uppercase">Kaydır</span>
          <div className="h-10 w-px bg-gradient-to-b from-[#c7a76f]/50 to-transparent" />
        </div>
      </section>

      {/* ── YAŞAM RAKAMLARI ── */}
      <section className="bg-[#173d31] px-5 py-0 sm:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#2a5a45] sm:grid-cols-4 sm:divide-y-0">
          {yearsLived !== null && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{yearsLived}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">yıl</div>
              <div className="mt-1 text-xs text-[#6b9e86]">Bereketli bir ömür</div>
            </div>
          )}
          {(allMemories?.length ?? 0) > 0 && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{allMemories!.length}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">anı</div>
              <div className="mt-1 text-xs text-[#6b9e86]">Paylaşılan hatıra</div>
            </div>
          )}
          {hasFamilyMembers && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{familyMembers!.length}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">kişi</div>
              <div className="mt-1 text-xs text-[#6b9e86]">Aile ağacı</div>
            </div>
          )}
          {hasPhotos && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{photos!.length}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">fotoğraf</div>
              <div className="mt-1 text-xs text-[#6b9e86]">Arşivlenen an</div>
            </div>
          )}
        </div>
      </section>

      {/* ── YAPIŞKAN SEKMELER ── */}
      {tabs.length > 0 && (
        <nav id="sekmeler" className="sticky top-16 z-30 border-b border-[#e6dccb] bg-[#fbf8f1]/96 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 sm:px-8">
            {tabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="shrink-0 border-b-2 border-transparent px-4 py-4 text-sm text-[#665d50] transition hover:border-[#b08340] hover:text-[#173d31]"
              >
                {tab.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* ── BİYOGRAFİ ── */}
      {hasStory && (
        <section id="hikaye" className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3 text-[#b08340]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.2em] uppercase">Hayat Hikayesi</span>
              </div>
              <h2 className="mt-3 font-serif text-5xl leading-tight text-[#173d31]">
                Bir insanın<br />
                <span className="text-[#b08340]">dolu dolu hayatı.</span>
              </h2>
              {vault.biography ? (
                <div className="mt-7 space-y-5 text-base leading-8 text-[#4c463c]">
                  {vault.biography.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-7 max-w-2xl text-base leading-8 text-[#4c463c]">
                  Bu sayfada onun hayatından izler, kişisel bilgileri ve sevdiklerinin bıraktığı hatıralar yer alıyor.
                </p>
              )}
            </div>

            <div className="flex flex-col justify-center gap-6">
              {hasPersonalDetails && (
                <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/6">
                  <div className="flex items-center gap-3 text-[#b08340]">
                    <span className="h-px w-8 bg-[#c7a76f]" />
                    <span className="text-xs tracking-[0.2em] uppercase">Kişisel Bilgiler</span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {vault.profession && (
                      <div className="rounded-xl border border-[#eadfca] bg-[#fbf8f1] px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a7a64]">Meslek</div>
                        <div className="mt-1 font-serif text-lg text-[#173d31]">{vault.profession}</div>
                      </div>
                    )}
                    {vault.hobbies && (
                      <div className="rounded-xl border border-[#eadfca] bg-[#fbf8f1] px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a7a64]">Hobileri</div>
                        <div className="mt-1 text-sm leading-6 text-[#4c463c]">{vault.hobbies}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {hasFavoriteSong && (
                <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/6">
                  <div className="flex items-center gap-3 text-[#b08340]">
                    <span className="h-px w-8 bg-[#c7a76f]" />
                    <span className="text-xs tracking-[0.2em] uppercase">En Sevdiği Şarkı</span>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#eadfca] bg-[#fbf8f1] p-4">
                    <div className="font-serif text-lg text-[#173d31]">
                      {vault.favorite_song_title ?? 'Onu hatırlatan şarkı'}
                    </div>
                    <audio controls src={vault.favorite_song_url ?? undefined} className="mt-3 h-9 w-full" />
                  </div>
                </div>
              )}
              {hasDonationPreference && (
                <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/6">
                  <div className="flex items-center gap-3 text-[#b08340]">
                    <span className="h-px w-8 bg-[#c7a76f]" />
                    <span className="text-xs tracking-[0.2em] uppercase">Bağış Yönlendirmesi</span>
                  </div>
                  <p className="mt-4 rounded-xl border border-[#eadfca] bg-[#fbf8f1] px-4 py-3 text-sm leading-7 text-[#4c463c]">
                    {vault.donation_preference}
                  </p>
                </div>
              )}
              {vault.tagline && (
                <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-8 shadow-lg shadow-[#4d3d26]/6">
                  <div className="font-serif text-6xl leading-none text-[#c7a76f]">&ldquo;</div>
                  <p className="mt-2 font-serif text-xl italic leading-9 text-[#4c463c]">
                    {vault.tagline}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#e1d5c3]" />
                    <div className="text-right">
                      <div className="font-serif text-base text-[#173d31]">{vault.display_name}</div>
                      <div className="text-xs text-[#8a7a64]">Ailesinden</div>
                    </div>
                  </div>
                </div>
              )}
              {(yearsLived !== null || daysSince !== null) && (
                <div className="grid grid-cols-2 gap-4">
                  {yearsLived !== null && (
                    <div className="rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5 text-center">
                      <Feather className="mx-auto h-7 w-7 text-[#b08340]" />
                      <div className="mt-2 font-serif text-3xl text-[#173d31]">{yearsLived}</div>
                      <div className="mt-1 text-xs text-[#665d50]">Yıl yaşadı</div>
                    </div>
                  )}
                  {daysSince !== null && (
                    <div className="rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5 text-center">
                      <CalendarDays className="mx-auto h-7 w-7 text-[#b08340]" />
                      <div className="mt-2 font-serif text-3xl text-[#173d31]">{daysSince.toLocaleString('tr-TR')}</div>
                      <div className="mt-1 text-xs text-[#665d50]">Gün oldu</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── KRONOLOJİ ── */}
      {hasTimeline && (
        <section id="kronoloji" className="border-y border-[#172d25] bg-[#091712] px-5 py-16 text-[#efe7d8] sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3 text-[#c7a76f]">
                  <span className="h-px w-10 bg-[#c7a76f]" />
                  <span className="text-xs tracking-[0.2em] uppercase">Yaşam Kronolojisi</span>
                </div>
                <h2 className="mt-3 font-serif text-5xl text-white">Zaman Yolculuğu</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#b8aa93]">
                  Önemli anlara bir yolculuk.{yearsLived !== null ? ` ${yearsLived} yıllık hikaye.` : ''}
                </p>
              </div>
              <div className="flex w-full gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold text-[#cfc3ad] sm:w-auto">
                {['Zaman Çizgisi', 'Slayt Gösterisi', 'Yaş Seçimi'].map((label, i) => (
                  <div
                    key={label}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-center transition sm:flex-none ${
                      i === 0 ? 'bg-[#c7a76f] text-[#091712] shadow-lg shadow-black/20' : 'text-[#cfc3ad]'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <TimelineSection
              events={timelineMemories.map((e) => ({
                id: e.id,
                year: e.memory_date ? String(new Date(e.memory_date).getFullYear()) : null,
                title: e.title ?? null,
                content: e.content ?? null,
                media_url: e.media_url ?? null,
              }))}
            />
          </div>
        </section>
      )}

      {/* ── VİDEO ANILAR ── */}
      {hasVideos && (
        <section id="videolar" className="bg-[#0c3327] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <div className="flex items-center gap-3 text-[#c7a76f]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.2em] uppercase">Video Anılar</span>
              </div>
              <h2 className="mt-3 font-serif text-5xl text-white">
                Hareket eden<br />
                <span className="text-[#c7a76f]">anlar.</span>
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              {/* Featured video */}
              {(() => {
                const vid0 = videos![0]
                const embed = getVideoEmbed(vid0.original_url)
                const thumb = getVideoThumb(vid0.original_url, vid0.thumb_url)
                return (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#173d31] shadow-xl shadow-black/20">
                    {embed ? (
                      <div className="aspect-video">
                        <iframe src={embed} className="h-full w-full" allowFullScreen title={vid0.original_filename ?? 'Video'} />
                      </div>
                    ) : (
                      <div className="aspect-video bg-black">
                        <video controls src={vid0.original_url} poster={thumb ?? undefined} className="h-full w-full" preload="metadata" />
                      </div>
                    )}
                    {vid0.caption && (
                      <div className="p-4"><p className="text-sm text-[#b8aa93]">{vid0.caption}</p></div>
                    )}
                  </div>
                )
              })()}

              {/* Side videos */}
              {videos!.length > 1 && (
                <div className="flex flex-col gap-4">
                  {videos!.slice(1).map((vid) => {
                    const embed = getVideoEmbed(vid.original_url)
                    const thumb = getVideoThumb(vid.original_url, vid.thumb_url)
                    return (
                      <div key={vid.id} className="group flex-1 overflow-hidden rounded-xl bg-black">
                        {embed ? (
                          <div className="aspect-video"><iframe src={embed} className="h-full w-full" allowFullScreen title={vid.original_filename ?? ''} /></div>
                        ) : (
                          <div className="aspect-video">
                            <video controls src={vid.original_url} poster={thumb ?? undefined} className="h-full w-full" preload="metadata" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOTOĞRAFLAR ── */}
      {hasPhotos && (
        <section id="fotograflar" className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 text-[#b08340]">
                  <span className="h-px w-10 bg-[#c7a76f]" />
                  <span className="text-xs tracking-[0.2em] uppercase">Fotoğraf Arşivi</span>
                </div>
                <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
                  Donmuş anlar,<br />
                  <span className="text-[#b08340]">canlı hatıralar.</span>
                </h2>
              </div>
              <span className="hidden text-sm text-[#8a7a64] sm:block">{photos!.length} fotoğraf</span>
            </div>

            <div className="columns-2 gap-4 md:columns-3">
              {photos!.map((p, i) => (
                <div
                  key={p.id}
                  className={`group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[#e1d5c3] bg-[#fffdf8] ${
                    i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
                  }`}
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={p.thumb_url ?? p.original_url}
                      alt={p.original_filename ?? ''}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    {(p.caption || p.original_filename) && (
                      <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <p className="font-serif text-sm text-white">{p.caption ?? p.original_filename}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SON MESAJ ── */}
      {vault.last_message && (
        <section id="son-mesaj" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Bıraktığı Son Mesaj</span>
            </div>
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
              Hayattayken<br />
              sevdiklerine bıraktığı satırlar.
            </h2>
          </div>

          <div className="relative mx-auto mt-12 max-w-2xl">
            <div className="absolute -left-5 -top-5 select-none font-serif text-[120px] leading-none text-[#c7a76f]/15">&ldquo;</div>
            <div className="relative overflow-hidden rounded-2xl border border-[#d7c7ae] bg-[#fffdf6] shadow-2xl shadow-[#4d3d26]/12">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#c7a76f]/60 to-transparent" />
              <div className="p-6 sm:p-10 lg:p-14">
                <Feather className="mx-auto mb-6 h-8 w-8 text-[#b08340]/60" />
                <div className="space-y-5 font-serif text-xl italic leading-9 text-[#4c463c]">
                  {vault.last_message.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-[#e1d5c3] pt-6">
                  <div>
                    <div className="font-serif text-2xl text-[#173d31]">{vault.display_name}</div>
                    {vault.death_place && <div className="mt-1 text-xs text-[#8a7a64]">{vault.death_place}</div>}
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#c7a76f]/30 bg-[#f4eee3] shadow-inner">
                    <span className="font-serif text-lg text-[#b08340]">{vaultInitial}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SES KAYITLARI ── */}
      {hasAudio && (
        <AudioPlayerSection
          recordings={audioRecordings!.map((r) => ({
            id: r.id,
            title: r.title,
            author: (r.author as string | null) ?? null,
            audio_url: r.audio_url,
          }))}
        />
      )}

      {/* ── ÖNE ÇIKAN ANILAR ── */}
      {hasFeatured && (
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <div className="flex items-center justify-center gap-3 text-[#b08340]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.2em] uppercase">Öne Çıkan Anılar</span>
              </div>
              <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
                Sevenlerinin<br />
                <span className="text-[#b08340]">sözleriyle.</span>
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {featuredMemories.map((mem) => (
                <div key={mem.id} className="group relative overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/6 transition hover:shadow-xl hover:shadow-[#4d3d26]/10">
                  <div className="absolute right-6 top-5 select-none font-serif text-7xl leading-none text-[#f4eee3]">&ldquo;</div>
                  <Heart className="mb-5 h-6 w-6 text-[#b08340]/60" />
                  <p className="relative z-10 font-serif text-lg italic leading-8 text-[#4c463c]">
                    &ldquo;{mem.content}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-[#e1d5c3] pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eee3] text-sm font-semibold text-[#b08340]">
                      {mem.title?.[0] ?? '?'}
                    </div>
                    <div>
                      <div className="font-serif text-base text-[#173d31]">{mem.title}</div>
                      {mem.memory_date && (
                        <div className="text-xs text-[#8a7a64]">
                          {new Date(mem.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ANILAR (regular) ── */}
      {hasRegularMemories && (
        <section id="anilar" className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Anılar</span>
            </div>
            <h2 className="mb-8 font-serif text-4xl text-[#173d31] sm:text-5xl">
              Sevenlerinin<br />
              <span className="text-[#b08340]">bıraktığı izler.</span>
            </h2>
            <div className="space-y-3">
              {regularMemories.map((m) => {
                const embedUrl = m.media_type === 'video' && m.media_url ? getVideoEmbed(m.media_url) : null
                return (
                  <div key={m.id} className="group overflow-hidden rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] shadow-sm shadow-[#4d3d26]/5 transition hover:shadow-md hover:shadow-[#4d3d26]/8">
                    <div className="flex gap-4 p-4 sm:p-5">
                      {/* Thumbnail */}
                      {m.media_type === 'image' && m.media_url && (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e1d5c3] bg-[#f4eee3] sm:h-24 sm:w-24">
                          <Image
                            src={m.media_url}
                            alt={m.title ?? 'Anı'}
                            fill
                            sizes="96px"
                            className="object-cover transition duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                      )}
                      {embedUrl && (
                        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#e1d5c3] bg-[#f4eee3] sm:h-24 sm:w-40">
                          <iframe src={embedUrl} className="h-full w-full" allowFullScreen title={m.title ?? ''} />
                        </div>
                      )}
                      {m.media_type === 'video' && m.media_url && !embedUrl && (
                        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#e1d5c3] bg-black sm:h-24 sm:w-40">
                          <video controls src={m.media_url} className="h-full w-full object-cover" preload="metadata" />
                        </div>
                      )}
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        {m.memory_date && (
                          <p className="mb-1 text-xs font-semibold tracking-wide text-[#b08340]">
                            {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        )}
                        {m.title && <h3 className="mb-1.5 font-serif text-base text-[#173d31] sm:text-lg">{m.title}</h3>}
                        <p className="line-clamp-3 text-sm leading-6 text-[#4c463c]">{m.content}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TAZİYE DEFTERİ ── */}
      <div id="taziye">
        <RealMemorialInteractionsWrapper entries={guestbookEntries} vaultId={id} initialCounts={initialCounts} siteKey={turnstileSiteKey} />
      </div>

      {/* ── AİLE BAĞLARI ── */}
      {hasFamilyMembers && (
        <section id="aile-baglari" className="bg-[#091712] px-5 py-12 text-[#efe7d8] sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-9 flex flex-col gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
              <div>
                <div className="flex items-center justify-center gap-3 text-[#c7a76f] lg:justify-start">
                  <span className="h-px w-10 bg-[#c7a76f]" />
                  <span className="text-xs tracking-[0.2em] uppercase">Aile Bağları</span>
                </div>
                <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
                  Köklerden<br />
                  <span className="text-[#c7a76f]">yeni nesillere.</span>
                </h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30">
              <div className="relative p-4 sm:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,167,111,0.10),transparent_45%)]" />
                <div className="relative">
                  <FamilyTreeCanvas
                    vault={{
                      display_name: vault.display_name,
                      cover_photo_url: vault.cover_photo_url,
                      birth_date: vault.birth_date,
                      death_date: vault.death_date,
                    }}
                    members={(familyMembers ?? []).map((m) => ({
                      id: m.id,
                      full_name: m.full_name,
                      relationship: m.relationship,
                      photo_url: m.photo_url ?? null,
                      birth_date: m.birth_date ?? null,
                      death_date: m.death_date ?? null,
                      is_alive: m.is_alive ?? true,
                      parent_member_id: (m as Record<string, unknown>).parent_member_id as string | null ?? null,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ZİYARET BİLGİSİ ── */}
      {hasCemetery && (
        <section id="ziyaret" className="border-t border-[#e6dccb] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <div className="flex items-center gap-3 text-[#b08340]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.2em] uppercase">Ziyaret Bilgisi</span>
              </div>
              <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
                Mezarda<br />
                <span className="text-[#b08340]">bir ziyaret.</span>
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] shadow-xl shadow-[#4d3d26]/8">
              <div className="grid bg-[#fffdf8] lg:grid-cols-[1fr_1.5fr]">
                {/* Bilgi paneli */}
                <div className="space-y-5 border-b border-[#e1d5c3] p-5 lg:border-b-0 lg:border-r lg:p-7">
                  <h3 className="font-serif text-2xl text-[#173d31]">Mezar Bilgileri</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                      <div>
                        <div className="text-xs text-[#8a7a64]">Mezarlık</div>
                        <div className="font-serif text-base text-[#173d31]">{vault.cemetery_name}</div>
                        {vault.cemetery_address && (
                          <div className="mt-0.5 text-xs text-[#8a7a64]">{vault.cemetery_address}</div>
                        )}
                      </div>
                    </div>
                    {(v.cemetery_plot as string | null) && (
                      <div className="flex items-start gap-3">
                        <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                        <div>
                          <div className="text-xs text-[#8a7a64]">Ada / Parsel</div>
                          <div className="font-serif text-base text-[#173d31]">{v.cemetery_plot as string}</div>
                        </div>
                      </div>
                    )}
                    {(v.cemetery_row as string | null) && (
                      <div className="flex items-start gap-3">
                        <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                        <div>
                          <div className="text-xs text-[#8a7a64]">Sıra / Numara</div>
                          <div className="font-serif text-base text-[#173d31]">{v.cemetery_row as string}</div>
                        </div>
                      </div>
                    )}
                    {(v.cemetery_hours as string | null) && (
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                        <div>
                          <div className="text-xs text-[#8a7a64]">Ziyaret Saatleri</div>
                          <div className="font-serif text-base text-[#173d31]">{v.cemetery_hours as string}</div>
                        </div>
                      </div>
                    )}
                    {vault.death_place && (
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                        <div>
                          <div className="text-xs text-[#8a7a64]">Vefat Yeri</div>
                          <div className="font-serif text-base text-[#173d31]">{vault.death_place}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {(v.cemetery_note as string | null) && (
                    <div className="rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-4">
                      <p className="text-xs leading-6 text-[#5b5245]">
                        <span className="font-semibold text-[#173d31]">Not:</span> {v.cemetery_note as string}
                      </p>
                    </div>
                  )}
                </div>

                {/* Harita */}
                <div className="relative min-h-[320px] overflow-hidden">
                  {(v.cemetery_lat && v.cemetery_lng) ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${v.cemetery_lat},${v.cemetery_lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="h-full min-h-[320px] w-full border-0"
                      loading="lazy"
                      title="Mezarlık konumu"
                      allowFullScreen
                    />
                  ) : vault.cemetery_name ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(vault.cemetery_name + ' ' + (vault.cemetery_address ?? ''))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="h-full min-h-[320px] w-full border-0"
                      loading="lazy"
                      title="Mezarlık konumu"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center bg-[#f7f2e9] text-[#8a7a64]">
                      <div className="text-center">
                        <div className="mb-2 text-4xl">🗺️</div>
                        <p className="text-sm">Konum bilgisi eklenmemiş</p>
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 rounded-br-2xl border border-[#e1d5c3]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="bg-[#0c3327] px-5 py-12 text-[#efe7d8] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandLogo light />
            <p className="mt-4 max-w-xs font-serif text-lg italic leading-7 text-[#cfc3ad]">
              Anılar yaşar, büyük sevgiler sonsuzdur.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg">Platform</h3>
            <div className="mt-4 space-y-2">
              <Link href="/" className="block text-sm text-[#cfc3ad] transition hover:text-white">Ana Sayfa</Link>
              <Link href="/memorial/demo" className="block text-sm text-[#cfc3ad] transition hover:text-white">Örnek Profil</Link>
              <Link href="/pricing" className="block text-sm text-[#cfc3ad] transition hover:text-white">Fiyatlandırma</Link>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-lg">Belgeler</h3>
            <div className="mt-4 space-y-2">
              <Link href="/privacy" className="block text-sm text-[#cfc3ad] transition hover:text-white">Gizlilik Politikası</Link>
              <Link href="/terms" className="block text-sm text-[#cfc3ad] transition hover:text-white">Kullanım Koşulları</Link>
              <Link href="/kvkk" className="block text-sm text-[#cfc3ad] transition hover:text-white">KVKK</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-[#b8aa93]">
          © {new Date().getFullYear()} The Eternal Memory. Tüm hakları saklıdır.
        </div>
      </footer>

    </div>
  )
}
