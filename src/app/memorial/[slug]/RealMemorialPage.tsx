import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Clock, Feather, Heart, MapPin, Navigation, PenLine } from 'lucide-react'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas'
import AudioPlayerSection from './AudioPlayerSection'
import RealMemorialInteractionsWrapper from './RealMemorialInteractionsWrapper'
import ProfilePhotoCircle from './ProfilePhotoCircle'
import HeroPanelEmojiBar from './HeroPanelEmojiBar'
import TimelineClient from './TimelineClient'
import MemoryBookClient from './MemoryBookClient'
import MemoriesAccordion from './MemoriesAccordion'
import PhotoGallery from './PhotoGallery'
import { getTurnstileSiteKey } from '@/lib/turnstile'
import { getTranslation } from '@/i18n/server'
import { ACTION_ICON_MAP, type ActionIcon } from '@/lib/memorial-style-templates'
import NotableProfilePhoto from './NotableProfilePhoto'
import LangSwitcher from './LangSwitcher'
import NotableShareButton from './NotableShareButton'
import NotableIntroPopup from './NotableIntroPopup'

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
  donation_url: string | null
  last_message: string | null
  cemetery_name: string | null
  cemetery_address: string | null
  product_type: string
  status: string
  pub_settings: Record<string, boolean> | null
  theme: string | null
  hero_left_react_heart: number; hero_left_react_pray: number; hero_left_react_smile: number; hero_left_react_cry: number; hero_left_react_dove: number
  hero_right_react_heart: number; hero_right_react_pray: number; hero_right_react_smile: number; hero_right_react_cry: number; hero_right_react_dove: number
  // Notable / National Heritage fields
  is_notable: boolean | null
  nationality: string | null
  notable_subtitle: string | null
  notable_motto: string | null
  notable_motto_tr: string | null
  featured_quote: string | null
  notable_legacy_text: string | null
  notable_verified_note: string | null
  notable_intro_text: string | null
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

function getCoordinate(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

function nationalityFlag(code: string | null): string {
  if (!code || code.length !== 2) return ''
  return code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('')
}

export default async function RealMemorialPage({ vault, isPreview = false }: Props) {
  const id = vault.id
  const supabase = isPreview ? await createServiceClient() : await createClient()
  const { t, lang } = await getTranslation()

  const v = vault as unknown as Record<string, unknown>
  const [
    { data: photos },
    { data: videos },
    { data: allMemories },
    { data: familyMembers },
    { data: audioRecordings },
    guestbookResult,
    reactionsResult,
    { data: memorialActionsRaw },
    { data: approvedMemories },
  ] = await Promise.all([
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'image').eq('is_public', true).order('sort_order', { ascending: true }).limit(24),
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'video').eq('is_public', true).order('sort_order', { ascending: true }).limit(6),
    supabase.from('vault_memories').select('*').eq('vault_id', id).eq('is_secret', false).order('memory_date', { ascending: true }).limit(200),
    supabase.from('vault_family_members').select('*').eq('vault_id', id).order('sort_order'),
    supabase.from('vault_audio_recordings').select('*').eq('vault_id', id).eq('is_public', true).order('sort_order'),
    supabase.from('guestbook_entries').select('*').eq('vault_id', id).eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
    supabase.rpc('count_memorial_reactions', { p_vault_id: id }),
    supabase.from('memorial_actions').select('id, label, icon, show_counter, count, sort_order').eq('memorial_id', id).eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('memory_book_entries').select('id, author_name, relation, memory_text, photo_url, created_at').eq('vault_id', id).eq('status', 'approved').order('created_at', { ascending: false }).limit(30),
  ])

  const customActions = (memorialActionsRaw ?? []).map(a => ({
    id: a.id as string,
    label: a.label as string,
    icon: a.icon as string,
    show_counter: a.show_counter as boolean,
    count: (a.count as number) ?? 0,
  }))

  const guestbookEntries = (guestbookResult.data ?? []) as {
    id: string
    author_name: string
    relation: string | null
    message: string
    created_at: string
    react_heart: number
    react_pray: number
    react_smile: number
    react_cry: number
    react_dove: number
  }[]

  const reactionAgg = (reactionsResult.data ?? {}) as { candle?: number; flower?: number; prayer?: number }
  const initialCounts = {
    candle: reactionAgg.candle ?? 0,
    flower: reactionAgg.flower ?? 0,
    prayer: reactionAgg.prayer ?? 0,
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
  const hasStory = !!vault.biography || hasFavoriteSong

  const heroBgUrl = v.hero_bg_url as string | null | undefined
  const cemeteryLat = getCoordinate(v.cemetery_lat)
  const cemeteryLng = getCoordinate(v.cemetery_lng)
  const cemeteryQuery = cemeteryLat && cemeteryLng
    ? `${cemeteryLat},${cemeteryLng}`
    : `${vault.cemetery_name ?? ''} ${vault.cemetery_address ?? ''}`.trim()
  const cemeteryMapUrl = cemeteryQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cemeteryQuery)}`
    : null
  const cemeteryDirectionsUrl = cemeteryQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cemeteryQuery)}`
    : null

  const isNotable = !!vault.is_notable

  const tabs = [
    { href: '#hikaye', label: t.memorial.lifeStory, show: hasStory },
    { href: '#kronoloji', label: t.memorial.chronology, show: hasTimeline },
    { href: '#videolar', label: t.memorial.videoMemories, show: hasVideos },
    { href: '#fotograflar', label: t.memorial.photoArchive, show: hasPhotos },
    { href: '#son-mesaj', label: isNotable ? (lang === "ka" ? "დარჩენილი სიტყვა" : lang === "ru" ? "Оставленные слова" : lang === "en" ? "Remaining Words" : "Geride Kalan Söz") : t.memorial.lastMessageTitle, show: !!vault.last_message },
    { href: '#anilar', label: t.memorial.memories, show: hasRegularMemories },
    { href: '#taziye', label: t.memorial.guestbook, show: true },
    { href: '#ziyaret', label: t.memorial.visitInfo, show: hasCemetery },
  ].filter((t) => t.show)

  return (
    <div className={`theme-${vault.theme || 'classic_emerald'} min-h-screen bg-[#fbf8f1] text-[#173d31]`}>
      {isNotable && vault.notable_intro_text && !isPreview && (
        <NotableIntroPopup
          slug={vault.id}
          introText={vault.notable_intro_text}
          displayName={vault.display_name}
          lang={lang}
        />
      )}

      {/* ── Preview banner ── */}
      {isPreview && (
        <div className="bg-[#c7a76f] px-4 py-2 text-center text-xs font-semibold text-[#091712]">
          {t.memorial.previewModeBanner}
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-[#e6dccb]/50 bg-[#fbf8f1]/96 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <LangSwitcher currentLang={lang} />
            <div className="hidden text-xs text-[#8a7a64] sm:block">{t.memorial.digitalMemorialProfile}</div>
          </div>
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
            className="object-cover object-center opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/images/landing/memorial-cemetery.png')] bg-cover bg-center opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c3327]/80 via-[#0c3327]/55 to-[#0c3327]/10" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-5 px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-[1fr_380px_1fr] lg:gap-10 lg:py-20">

          {/* Left — Ailesinden */}
          <div className="order-2 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6 lg:order-1">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.22em] uppercase">{isNotable ? (lang === "ka" ? "ქართველი ხალხისგან" : lang === "ru" ? "От грузинского народа" : lang === "en" ? "From the Georgian People" : "Gürcü Halkından") : t.memorial.fromFamily}</span>
            </div>
            <p className="font-serif text-lg leading-8 text-white sm:text-xl sm:leading-9">
              {vault.tagline ?? 'Saygıyla anıyoruz. Bize bıraktığı sevgi ve hatıralar her zaman kalbimizde yaşayacak.'}
            </p>
            <HeroPanelEmojiBar
              vaultId={id}
              panel="left"
              initialCounts={{ heart: vault.hero_left_react_heart ?? 0, pray: vault.hero_left_react_pray ?? 0, smile: vault.hero_left_react_smile ?? 0, cry: vault.hero_left_react_cry ?? 0, dove: vault.hero_left_react_dove ?? 0 }}
            />
            <a
              href="#taziye"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#c7a76f] px-4 py-2.5 text-xs font-semibold text-[#0c3327] transition hover:bg-[#d4b87c]"
            >
              {t.memorial.guestbook} <PenLine className="h-4 w-4" />
            </a>
          </div>

          {/* Center — Portrait */}
          <div className="order-1 text-center lg:order-2">
            {vault.is_notable ? (
              /* Notable badge — rozet mühür */
              <div className="mx-auto mb-4 flex w-fit flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-[#dfbd72]">
                  <span className="h-px w-6 bg-[#dfbd72]" />
                  <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">{t.memorial.notableBadgeTitle}</span>
                  <span className="h-px w-6 bg-[#dfbd72]" />
                </div>
                {vault.notable_subtitle && (
                  <p className="text-[11px] text-[#c7a76f]/80 italic max-w-[260px] leading-relaxed">{vault.notable_subtitle}</p>
                )}
              </div>
            ) : (
              <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c7a76f]">
                <span className="h-px w-8 bg-[#c7a76f]" />
                <span className="text-xs tracking-[0.25em] uppercase">{t.memorial.digitalMonumentProfile}</span>
                <span className="h-px w-8 bg-[#c7a76f]" />
              </div>
            )}

            {vault.is_notable ? (
              <NotableProfilePhoto
                src={vault.cover_photo_url ?? ''}
                alt={vault.display_name}
                initial={vaultInitial}
              />
            ) : (
              <ProfilePhotoCircle
                src={vault.cover_photo_url ?? ''}
                alt={vault.display_name}
                initial={vaultInitial}
              />
            )}

            <h1 className="mt-5 font-serif text-4xl leading-none text-white sm:mt-7 sm:text-6xl">
              {vault.display_name}
            </h1>
            <div className="mt-3 flex items-center justify-center gap-4 font-serif text-lg text-[#efe7d8]/80 sm:text-xl">
              <span>{birthYear ?? '?'}</span>
              <Feather className="h-4 w-4 text-[#c7a76f]" />
              <span>{deathYear ?? '?'}</span>
              {vault.is_notable && vault.nationality && (
                <img
                  src={`https://flagcdn.com/32x24/${vault.nationality!.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/64x48/${vault.nationality!.toLowerCase()}.png 2x`}
                  width={32}
                  height={24}
                  alt={vault.nationality!}
                  className="rounded-sm inline-block"
                />
              )}
            </div>
            {vault.birth_place && (
              <p className="mx-auto mt-2 max-w-xs font-serif text-sm italic leading-6 text-[#cfc3ad]">
                📍 {vault.birth_place}
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6">
              {yearsLived !== null && (
                <div className="rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-3 backdrop-blur-sm">
                  <div className="font-serif text-2xl text-white sm:text-3xl">{yearsLived}</div>
                  <div className="mt-1 text-xs text-[#c7a76f]">{t.memorial.years}</div>
                </div>
              )}
              {daysSince !== null && (
                <div className="rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-3 backdrop-blur-sm">
                  <div className="font-serif text-2xl text-white sm:text-3xl">{daysSince.toLocaleString(lang)}</div>
                  <div className="mt-1 text-xs text-[#c7a76f]">{t.memorial.daysAgo}</div>
                </div>
              )}
            </div>
            {daysSince !== null && (
              <div className="mt-3 rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#c7a76f] backdrop-blur-sm">
                {t.memorial.sincePassing}
              </div>
            )}
          </div>

          {/* Right — Son Mesaj */}
          <div className="order-3 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.22em] uppercase">{t.memorial.wordsFromThemLimit}</span>
            </div>
            <div className="font-serif text-5xl leading-none text-[#c7a76f]/35">&ldquo;</div>
            <p className="mt-1 font-serif text-lg italic leading-8 text-white sm:text-xl sm:leading-9">
              {vault.last_message ?? t.memorial.noLastMessage}
            </p>
            <HeroPanelEmojiBar
              vaultId={id}
              panel="right"
              initialCounts={{ heart: vault.hero_right_react_heart ?? 0, pray: vault.hero_right_react_pray ?? 0, smile: vault.hero_right_react_smile ?? 0, cry: vault.hero_right_react_cry ?? 0, dove: vault.hero_right_react_dove ?? 0 }}
            />
            <a
              href="#son-mesaj"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#c7a76f]/40 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              {t.memorial.exploreMemories} <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {hasDonationPreference && (
            <div className="order-4 rounded-2xl border border-[#c7a76f]/25 bg-[#091712]/65 p-5 text-center shadow-2xl shadow-black/20 backdrop-blur-sm lg:hidden">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c7a76f]">{t.memorial.donationPreference}</div>
              <p className="mt-2 text-xs leading-5 text-[#efe7d8]">{vault.donation_preference}</p>
              {vault.donation_url && (
                <a
                  href={vault.donation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#091712] transition hover:bg-[#d4b87c]"
                >
                  {t.memorial.clickToDonate}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 hidden w-[min(520px,calc(100%-48px))] -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <span className="text-[10px] tracking-[0.2em] text-[#c7a76f]/50 uppercase">{t.memorial.scroll}</span>
          <div className="h-10 w-px bg-gradient-to-b from-[#c7a76f]/50 to-transparent" />
          {hasDonationPreference && (
            <div className="w-full rounded-2xl border border-[#c7a76f]/25 bg-[#091712]/70 px-5 py-4 text-center shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c7a76f]">{t.memorial.donationPreference}</div>
              <p className="mt-2 text-xs leading-5 text-[#efe7d8]">{vault.donation_preference}</p>
              {vault.donation_url && (
                <a
                  href={vault.donation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#c7a76f] px-4 py-2 text-xs font-semibold text-[#091712] transition hover:bg-[#d4b87c]"
                >
                  {t.memorial.clickToDonate}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Notable: Motto band ── */}
      {vault.is_notable && vault.notable_motto && (
        <div className="bg-[#0c2a1e] border-y border-[#dfbd72]/20 px-5 py-6 text-center sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="h-px flex-1 max-w-[60px] bg-[#dfbd72]/30" />
              <span className="text-[#dfbd72]/50 text-lg">✦</span>
              <span className="h-px flex-1 max-w-[60px] bg-[#dfbd72]/30" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl text-[#dfbd72] tracking-wide leading-relaxed">
              {vault.notable_motto}
            </p>
            {vault.notable_motto_tr && (
              <p className="mt-2 text-sm text-[#c7a76f]/70 italic tracking-wide">{vault.notable_motto_tr}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="h-px flex-1 max-w-[60px] bg-[#dfbd72]/30" />
              <span className="text-[#dfbd72]/50 text-lg">✦</span>
              <span className="h-px flex-1 max-w-[60px] bg-[#dfbd72]/30" />
            </div>
          </div>
        </div>
      )}

      {/* ── Notable: Verified strip ── */}
      {vault.is_notable && (
        <div className="bg-[#091712] border-b border-[#dfbd72]/15 px-5 py-3 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5">
            <span className="text-[#dfbd72] text-sm">🏛</span>
            <p className="text-[11px] text-[#c7a76f]/80 tracking-wide text-center">
              {vault.notable_verified_note ?? t.memorial.notableVerifiedNote}
            </p>
          </div>
        </div>
      )}

      {/* ── Notable: Share button ── */}
      {isNotable && (
        <div className="bg-[#091712] border-b border-[#dfbd72]/10 px-5 py-4 sm:px-8 flex justify-center">
          <NotableShareButton displayName={vault.display_name} lang={lang} />
        </div>
      )}

      <section className="bg-[#173d31] px-5 py-0 sm:px-8">
        {hasPersonalDetails && (
          <div className="mx-auto grid max-w-7xl border-b border-[#2a5a45] text-[#efe7d8] md:grid-cols-2">
            {vault.profession && (
              <div className="border-[#2a5a45] px-6 py-6 md:border-r md:text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c7a76f]">{t.memorial.profession}</div>
                <div className="mt-2 font-serif text-2xl text-white">{vault.profession}</div>
              </div>
            )}
            {vault.hobbies && (
              <div className="px-6 py-6">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c7a76f]">{t.memorial.hobbies}</div>
                <div className="mt-2 font-serif text-2xl text-white">{vault.hobbies}</div>
              </div>
            )}
          </div>
        )}
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#2a5a45] sm:grid-cols-5 sm:divide-y-0">
          {yearsLived !== null && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{yearsLived}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">{t.memorial.yearsLived}</div>
              <div className="mt-1 text-xs text-[#6b9e86]">{t.memorial.blessedLife}</div>
            </div>
          )}
          {(allMemories?.length ?? 0) > 0 && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{allMemories!.length}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">{t.memorial.memoriesCount}</div>
              <div className="mt-1 text-xs text-[#6b9e86]">{t.memorial.sharedMemory}</div>
            </div>
          )}
          {hasFamilyMembers && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{familyMembers!.length}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">{t.memorial.people}</div>
              <div className="mt-1 text-xs text-[#6b9e86]">{t.memorial.familyTree}</div>
            </div>
          )}
          {hasPhotos && (
            <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
              <div className="font-serif text-5xl text-white">{photos!.length}</div>
              <div className="text-sm font-semibold text-[#c7a76f]">{t.memorial.photosCount}</div>
              <div className="mt-1 text-xs text-[#6b9e86]">{t.memorial.archivedMoments}</div>
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-1 px-6 py-7 text-center">
            <div className="font-serif text-5xl text-white">
              {((v.view_count as number) ?? 0).toLocaleString(lang)}
            </div>
            <div className="text-sm font-semibold text-[#c7a76f]">{lang === "ka" ? "მნახველი" : lang === "ru" ? "Посетители" : lang === "en" ? "Visitors" : "Ziyaretçi"}</div>
            <div className="mt-1 text-xs text-[#6b9e86]">{lang === "ka" ? "ამ გვერდს ეწვია" : lang === "ru" ? "Посетили эту страницу" : lang === "en" ? "Visited this page" : "Bu sayfayı ziyaret etti"}</div>
          </div>
        </div>

        {/* Notable profillerde anma istatistikleri — anma türüne göre */}
        {isNotable && (
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center divide-x divide-[#2a5a45] border-t border-[#2a5a45]">
            {customActions.length > 0 ? (
              customActions.map((action) => (
                <div key={action.id} className="flex items-center gap-2 px-5 py-4">
                  <span className="text-xl">{ACTION_ICON_MAP[action.icon as ActionIcon] ?? '⚡'}</span>
                  <div className="text-center">
                    <div className="font-serif text-2xl text-white">{action.count.toLocaleString(lang)}</div>
                    <p className="text-[11px] text-[#c7a76f] mt-0.5 max-w-[80px] leading-tight">{action.label}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2 px-5 py-4">
                  <span className="text-xl">🕯️</span>
                  <div className="text-center">
                    <div className="font-serif text-2xl text-white">{initialCounts.candle.toLocaleString(lang)}</div>
                    <p className="text-[11px] text-[#c7a76f] mt-0.5">{lang === "ka" ? "სანთელი" : lang === "ru" ? "Свечей" : lang === "en" ? "Candles" : "Mum"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-5 py-4">
                  <span className="text-xl">🌹</span>
                  <div className="text-center">
                    <div className="font-serif text-2xl text-white">{initialCounts.flower.toLocaleString(lang)}</div>
                    <p className="text-[11px] text-[#c7a76f] mt-0.5">{lang === "ka" ? "ყვავილი" : lang === "ru" ? "Цветов" : lang === "en" ? "Flowers" : "Çiçek"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-5 py-4">
                  <span className="text-xl">🙏</span>
                  <div className="text-center">
                    <div className="font-serif text-2xl text-white">{initialCounts.prayer.toLocaleString(lang)}</div>
                    <p className="text-[11px] text-[#c7a76f] mt-0.5">{lang === "ka" ? "ლოცვა" : lang === "ru" ? "Молитв" : lang === "en" ? "Prayers" : "Dua"}</p>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 px-5 py-4">
              <span className="text-xl">💬</span>
              <div className="text-center">
                <div className="font-serif text-2xl text-white">{guestbookEntries.length.toLocaleString(lang)}</div>
                <p className="text-[11px] text-[#c7a76f] mt-0.5">{lang === "ka" ? "გზავნილი" : lang === "ru" ? "Сообщений" : lang === "en" ? "Tributes" : "Mesaj"}</p>
              </div>
            </div>
          </div>
        )}
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
                <span className="text-xs tracking-[0.2em] uppercase">
                  {vault.is_notable ? t.memorial.nationsMemory : t.memorial.lifeStory}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-5xl leading-tight text-[#173d31]">
                {vault.is_notable ? t.memorial.nationsMemory : t.memorial.lifeStoryHeading}
              </h2>
              {vault.biography ? (
                <div className="mt-7 space-y-5 text-base leading-8 text-[#4c463c]">
                  {vault.biography.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-7 max-w-2xl text-base leading-8 text-[#4c463c]">
                  {t.memorial.defaultStoryText}
                </p>
              )}
            </div>

            <div className="flex flex-col justify-center gap-6">
              {hasFavoriteSong && (
                <div className="rounded-2xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/6">
                  <div className="flex items-center gap-3 text-[#b08340]">
                    <span className="h-px w-8 bg-[#c7a76f]" />
                    <span className="text-xs tracking-[0.2em] uppercase">{t.memorial.favoriteSong}</span>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#eadfca] bg-[#fbf8f1] p-4">
                    <div className="font-serif text-lg text-[#173d31]">
                      {vault.favorite_song_title ?? t.memorial.songReminder}
                    </div>
                    <audio controls src={vault.favorite_song_url ?? undefined} className="mt-3 h-9 w-full" />
                  </div>
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
                      <div className="text-xs text-[#8a7a64]">{isNotable ? (lang === "ka" ? "ქართველი ხალხისგან" : lang === "ru" ? "От грузинского народа" : lang === "en" ? "From the Georgian People" : "Gürcü Halkından") : t.memorial.fromFamily}</div>
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
                      <div className="mt-1 text-xs text-[#665d50]">{t.memorial.yearsLived}</div>
                    </div>
                  )}
                  {daysSince !== null && (
                    <div className="rounded-xl border border-[#e1d5c3] bg-[#fffdf8] p-5 text-center">
                      <CalendarDays className="mx-auto h-7 w-7 text-[#b08340]" />
                      <div className="mt-2 font-serif text-3xl text-[#173d31]">{daysSince.toLocaleString(lang)}</div>
                      <div className="mt-1 text-xs text-[#665d50]">{t.memorial.daysAgo}</div>
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
            <TimelineClient
              events={timelineMemories.map((e) => ({
                id: e.id,
                year: e.memory_date ? String(new Date(e.memory_date).getFullYear()) : null,
                title: e.title ?? null,
                content: e.content ?? null,
                media_url: e.media_url ?? null,
              }))}
              labels={{
                timeline: t.memorial.timeline,
                slideshow: t.memorial.slideshow,
                chronology: t.memorial.chronology,
                timeTravel: t.memorial.timeTravel,
                journeyToMoments: t.memorial.journeyToMoments,
                yearsStory: t.memorial.yearsStory,
                milestone: t.memorial.milestone,
              }}
              yearsLived={yearsLived}
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
                <span className="text-xs tracking-[0.2em] uppercase">{t.memorial.videoMemories}</span>
              </div>
              <h2 className="mt-3 font-serif text-5xl text-white">
                {t.memorial.movingMoments}
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              {/* Featured video */}
              {(() => {
                const vid0 = videos![0]
                const embed = vid0.cf_stream_id 
                  ? `https://iframe.videodelivery.net/${vid0.cf_stream_id}`
                  : getVideoEmbed(vid0.original_url)
                const thumb = vid0.cf_stream_id
                  ? `https://videodelivery.net/${vid0.cf_stream_id}/thumbnails/thumbnail.jpg`
                  : getVideoThumb(vid0.original_url, vid0.thumb_url)
                return (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#173d31] shadow-xl shadow-black/20">
                    {vid0.cf_stream_id || embed ? (
                      <div className="aspect-video">
                        <iframe 
                          src={embed || ''} 
                          className="h-full w-full border-0" 
                          allowFullScreen 
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          title={vid0.original_filename ?? 'Video'} 
                        />
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
                    const embed = vid.cf_stream_id
                      ? `https://iframe.videodelivery.net/${vid.cf_stream_id}`
                      : getVideoEmbed(vid.original_url)
                    const thumb = vid.cf_stream_id
                      ? `https://videodelivery.net/${vid.cf_stream_id}/thumbnails/thumbnail.jpg`
                      : getVideoThumb(vid.original_url, vid.thumb_url)
                    return (
                      <div key={vid.id} className="group flex-1 overflow-hidden rounded-xl bg-black">
                        {vid.cf_stream_id || embed ? (
                          <div className="aspect-video">
                            <iframe 
                              src={embed || ''} 
                              className="h-full w-full border-0" 
                              allowFullScreen 
                              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                              title={vid.original_filename ?? ''} 
                            />
                          </div>
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

      {hasPhotos && (
        <PhotoGallery
          photos={photos!.map(p => ({
            id: p.id,
            original_url: p.original_url,
            thumb_url: p.thumb_url ?? null,
            original_filename: (p.original_filename as string | null) ?? null,
            caption: (p as Record<string, unknown>).caption as string | null ?? null,
          }))}
          photoCount={photos!.length}
          photoArchiveLabel={t.memorial.photoArchive}
          tracesLabel={isNotable
            ? (lang === 'tr' ? 'Hayatından önemli anlar.' : lang === 'ka' ? 'მნიშვნელოვანი მომენტები.' : lang === 'ru' ? 'Важные моменты.' : 'Important moments.')
            : t.memorial.tracesLeftByLovedOnes}
          photosLabel={t.memorial.photos}
        />
      )}

      {/* ── SON MESAJ ── */}
      {vault.last_message && (
        <section id="son-mesaj" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">{isNotable ? (lang === "ka" ? "დარჩენილი სიტყვა" : lang === "ru" ? "Оставленные слова" : lang === "en" ? "Remaining Words" : "Geride Kalan Söz") : t.memorial.lastMessageTitle}</span>
            </div>
            <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
              {isNotable ? (lang === "ka" ? "სამშობლოს და თაობებისთვის დარჩენილი სიტყვები." : lang === "ru" ? "Слова, оставленные народу и поколениям." : lang === "en" ? "Words left for the nation and generations." : "Milletine ve nesillere bıraktığı satırlar.") : t.memorial.linesLeftForLovedOnes}
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
                <span className="text-xs tracking-[0.2em] uppercase">{t.memorial.featuredMemories}</span>
              </div>
              <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
                {t.memorial.withWordsOfLovedOnes}
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
                          {new Date(mem.memory_date).toLocaleDateString(lang, { year: 'numeric', month: 'long' })}
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
              <span className="text-xs tracking-[0.2em] uppercase">{t.memorial.memories}</span>
            </div>
            <h2 className="mb-8 font-serif text-4xl text-[#173d31] sm:text-5xl">
              {isNotable
                ? (lang === 'tr' ? 'Hayatından önemli anlar.' : lang === 'ka' ? 'მნიშვნელოვანი მომენტები.' : lang === 'ru' ? 'Важные моменты.' : 'Important moments.')
                : t.memorial.tracesLeftByLovedOnes}
            </h2>
            <MemoriesAccordion
              memories={regularMemories.map((m) => ({
                id: m.id,
                title: m.title ?? null,
                content: m.content ?? null,
                memory_date: m.memory_date ?? null,
                media_url: m.media_url ?? null,
                media_type: m.media_type ?? null,
                formattedDate: m.memory_date
                  ? new Date(m.memory_date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })
                  : null,
                embedUrl: m.media_type === 'video' && m.media_url ? getVideoEmbed(m.media_url) : null,
              }))}
            />
          </div>
        </section>
      )}

      {/* ── TAZİYE DEFTERİ ── */}
      <div id="taziye">
        <RealMemorialInteractionsWrapper entries={guestbookEntries} vaultId={id} initialCounts={initialCounts} siteKey={turnstileSiteKey} customActions={customActions} isNotable={isNotable} serverLang={lang} />
      </div>

      {/* ── ANI DEFTERİ ── */}
      <MemoryBookClient
        vaultId={id}
        lang={lang}
        texts={{
          guestbook: t.memorial.guestbook,
          sharedMemories: t.memorial.sharedMemories,
          shareMemory: t.memorial.shareMemory,
          shareYourMemory: t.memorial.shareYourMemory,
          memoriesModeratedNote: t.memorial.memoriesModeratedNote,
          memorySubmitted: t.memorial.memorySubmitted,
          fullName: t.memorial.fullName,
          yourRelation: t.memorial.yourRelation,
          relationPlaceholder: t.memorial.relationPlaceholder,
          memoryLabel: t.memorial.memoryLabel,
          memoryPlaceholder: t.memorial.memoryPlaceholder,
          photoOptionalLabel: t.memorial.photoOptionalLabel,
          addPhoto: t.memorial.addPhoto,
          emailOptional: t.memorial.emailOptional,
          uploadingLabel: t.memorial.uploadingLabel,
          submittingLabel: t.memorial.submittingLabel,
          submitLabel: t.memorial.submitLabel,
          noSharedMemories: t.memorial.noSharedMemories,
          beFirstToShare: t.memorial.beFirstToShare,
          requiredError: t.memorial.requiredError,
          photoError: t.memorial.photoError,
          photoUploadError: t.memorial.photoUploadError,
        }}
        initialMemories={(approvedMemories ?? []) as {
          id: string
          author_name: string
          relation: string | null
          memory_text: string
          photo_url: string | null
          created_at: string
        }[]}
      />

      {/* ── AİLE BAĞLARI ── */}
      {hasFamilyMembers && (
        <section id="aile-baglari" className="bg-[#091712] px-5 py-12 text-[#efe7d8] sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-9 flex flex-col gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
              <div>
                <div className="flex items-center justify-center gap-3 text-[#c7a76f] lg:justify-start">
                  <span className="h-px w-10 bg-[#c7a76f]" />
                  <span className="text-xs tracking-[0.2em] uppercase">{t.memorial.familyBonds}</span>
                </div>
                <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
                  {t.memorial.rootsToNewGenerations}
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
                <span className="text-xs tracking-[0.2em] uppercase">{t.memorial.visitInfo}</span>
              </div>
              <h2 className="mt-3 font-serif text-5xl text-[#173d31]">
                {t.memorial.visitAtGrave}
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e1d5c3] shadow-xl shadow-[#4d3d26]/8">
              <div className="grid bg-[#fffdf8] lg:grid-cols-[1fr_1.5fr]">
                {/* Bilgi paneli */}
                <div className="space-y-5 border-b border-[#e1d5c3] p-5 lg:border-b-0 lg:border-r lg:p-7">
                  <h3 className="font-serif text-2xl text-[#173d31]">{t.memorial.graveInfo}</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                      <div>
                        <div className="text-xs text-[#8a7a64]">{t.memorial.cemetery}</div>
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
                          <div className="text-xs text-[#8a7a64]">{t.memorial.plot}</div>
                          <div className="font-serif text-base text-[#173d31]">{v.cemetery_plot as string}</div>
                        </div>
                      </div>
                    )}
                    {(v.cemetery_row as string | null) && (
                      <div className="flex items-start gap-3">
                        <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                        <div>
                          <div className="text-xs text-[#8a7a64]">{t.memorial.row}</div>
                          <div className="font-serif text-base text-[#173d31]">{v.cemetery_row as string}</div>
                        </div>
                      </div>
                    )}
                    {(v.cemetery_hours as string | null) && (
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                        <div>
                          <div className="text-xs text-[#8a7a64]">{t.memorial.visitHours}</div>
                          <div className="font-serif text-base text-[#173d31]">{v.cemetery_hours as string}</div>
                        </div>
                      </div>
                    )}
                    {vault.death_place && (
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#b08340]" />
                        <div>
                          <div className="text-xs text-[#8a7a64]">{t.memorial.deathPlace}</div>
                          <div className="font-serif text-base text-[#173d31]">{vault.death_place}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {(v.cemetery_note as string | null) && (
                    <div className="rounded-xl border border-[#e1d5c3] bg-[#f7f2e9] p-4">
                      <p className="text-xs leading-6 text-[#5b5245]">
                        <span className="font-semibold text-[#173d31]">{t.memorial.note}</span> {v.cemetery_note as string}
                      </p>
                    </div>
                  )}
                  {(cemeteryDirectionsUrl || cemeteryMapUrl) && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {cemeteryDirectionsUrl && (
                        <a
                          href={cemeteryDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174f35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123f2b]"
                        >
                          <Navigation className="h-4 w-4" />
                          {t.memorial.getDirections}
                        </a>
                      )}
                      {cemeteryMapUrl && (
                        <a
                          href={cemeteryMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e1d5c3] bg-white px-4 py-3 text-sm font-semibold text-[#174f35] transition hover:bg-[#f7f2e9]"
                        >
                          <MapPin className="h-4 w-4" />
                          {t.memorial.openInMap}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Harita */}
                <div className="relative min-h-[320px] overflow-hidden">
                  {(cemeteryLat && cemeteryLng) ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${cemeteryLat},${cemeteryLng}&t=&z=18&ie=UTF8&iwloc=&output=embed`}
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
                        <p className="text-sm">{t.memorial.noLocationInfo}</p>
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

      {/* ── Notable: Legacy section ── */}
      {vault.is_notable && vault.notable_legacy_text && (
        <section className="bg-[#0f2a1e] px-5 py-16 sm:px-8 border-t border-[#dfbd72]/15">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 mb-5 text-[#dfbd72]">
              <span className="h-px w-12 bg-[#dfbd72]/40" />
              <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">{t.memorial.notableLegacyTitle}</span>
              <span className="h-px w-12 bg-[#dfbd72]/40" />
            </div>
            <div className="text-5xl text-[#dfbd72]/20 font-serif mb-2 leading-none">&ldquo;</div>
            <div className="font-serif text-lg sm:text-xl leading-9 text-[#e8dfc8] space-y-5">
              {vault.notable_legacy_text.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Notable: Featured quote band ── */}
      {vault.is_notable && vault.featured_quote && (
        <section className="bg-[#173d31] px-5 py-12 sm:px-8 border-t border-[#dfbd72]/10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-5xl text-[#dfbd72]/25 font-serif leading-none">&ldquo;</div>
            <blockquote className="mt-3 font-serif text-2xl sm:text-3xl italic leading-relaxed text-[#efe7d8]">
              {vault.featured_quote}
            </blockquote>
            <div className="mt-4 flex items-center justify-center gap-3 text-[#c7a76f]/60">
              <span className="h-px w-8 bg-[#c7a76f]/30" />
              <span className="text-xs tracking-widest uppercase">{vault.display_name}</span>
              <span className="h-px w-8 bg-[#c7a76f]/30" />
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
              {t.memorial.memoriesLiveLoveIsInfinite}
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg">{t.landing.footer.colPlatform}</h3>
            <div className="mt-4 space-y-2">
              <Link href="/" className="block text-sm text-[#cfc3ad] transition hover:text-white">{t.nav.home}</Link>
              <Link href="/memorial/demo" className="block text-sm text-[#cfc3ad] transition hover:text-white">{t.nav.demoProfile}</Link>
              <Link href="/pricing" className="block text-sm text-[#cfc3ad] transition hover:text-white">{t.nav.pricing}</Link>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-lg">{t.landing.footer.colDocs}</h3>
            <div className="mt-4 space-y-2">
              <Link href="/privacy" className="block text-sm text-[#cfc3ad] transition hover:text-white">{t.landing.footer.docLinks[0].label}</Link>
              <Link href="/terms" className="block text-sm text-[#cfc3ad] transition hover:text-white">{t.landing.footer.docLinks[1].label}</Link>
              <Link href="/kvkk" className="block text-sm text-[#cfc3ad] transition hover:text-white">KVKK</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-[#b8aa93]">
          © {new Date().getFullYear()} The Eternal Memory. {t.memorial.allRightsReserved}
        </div>
      </footer>

    </div>
  )
}
