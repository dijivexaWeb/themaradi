import Image from 'next/image'
import Link from 'next/link'
import { Feather, Heart, MapPin, Navigation, PenLine } from 'lucide-react'
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
  hero_bg_url: string | null
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
  cemetery_lat: string | number | null
  cemetery_lng: string | number | null
  cemetery_plot: string | null
  cemetery_row: string | null
  cemetery_hours: string | null
  cemetery_note: string | null
  product_type: string
  status: string
  pub_settings: Record<string, boolean> | null
}

interface Props {
  vault: VaultRow
  isPreview?: boolean
}

interface MediaItem {
  id: string
  original_url: string
  thumb_url: string | null
  original_filename: string | null
  caption: string | null
  media_type: string
}

interface MemoryItem {
  id: string
  title: string | null
  content: string | null
  section: string | null
  media_type: string | null
  media_url: string | null
  memory_date: string | null
}

interface FamilyMemberItem {
  id: string
  full_name: string
  relationship: string | null
  photo_url: string | null
  birth_date: string | null
  death_date: string | null
  is_alive: boolean | null
  parent_member_id: string | null
}

interface AudioRecordingItem {
  id: string
  title: string | null
  author: string | null
  audio_url: string
}

interface GuestbookEntry {
  id: string
  author_name: string
  relation: string | null
  message: string
  created_at: string
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getVideoEmbed(url: string): string | null {
  const youtubeId = getYouTubeId(url)
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

function getVideoThumb(url: string, fallback?: string | null): string | null {
  const youtubeId = getYouTubeId(url)
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
  return fallback ?? null
}

function getCoordinate(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('tr-TR', options)
}

function splitParagraphs(text: string | null) {
  if (!text) return []
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
}

export default async function RealMemorialPageModern({ vault, isPreview = false }: Props) {
  const id = vault.id
  const supabase = await createClient()

  const [photosResult, videosResult, memoriesResult, familyResult, audioResult, guestbookResult, reactionResult] = await Promise.all([
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'image').eq('is_public', true).order('sort_order', { ascending: true }).limit(24),
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'video').eq('is_public', true).order('sort_order', { ascending: true }).limit(6),
    supabase.from('vault_memories').select('*').eq('vault_id', id).eq('is_secret', false).order('memory_date', { ascending: true }),
    supabase.from('vault_family_members').select('*').eq('vault_id', id).order('sort_order'),
    supabase.from('vault_audio_recordings').select('*').eq('vault_id', id).eq('is_public', true).order('sort_order'),
    supabase.from('guestbook_entries').select('*').eq('vault_id', id).eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
    supabase.from('memorial_reactions').select('reaction_type').eq('vault_id', id),
  ])

  const photos = (photosResult.data ?? []) as MediaItem[]
  const videos = (videosResult.data ?? []) as MediaItem[]
  const allMemories = (memoriesResult.data ?? []) as MemoryItem[]
  const familyMembers = (familyResult.data ?? []) as FamilyMemberItem[]
  const audioRecordings = (audioResult.data ?? []) as AudioRecordingItem[]
  const guestbookEntries = (guestbookResult.data ?? []) as GuestbookEntry[]
  const reactionData = (reactionResult.data ?? []) as { reaction_type: string }[]

  const yearsLived = vault.birth_date && vault.death_date
    ? (() => {
      const birth = new Date(vault.birth_date)
      const death = new Date(vault.death_date)
      if (Number.isNaN(birth.getTime()) || Number.isNaN(death.getTime())) return null
      return Math.max(0, death.getFullYear() - birth.getFullYear())
    })()
    : null

  const introYear = formatDate(vault.birth_date, { year: 'numeric' }) ?? '––'
  const closingYear = formatDate(vault.death_date, { year: 'numeric' }) ?? '––'
  const heroImage = vault.hero_bg_url ?? vault.cover_photo_url
  const cemeteryLat = getCoordinate(vault.cemetery_lat)
  const cemeteryLng = getCoordinate(vault.cemetery_lng)
  const cemeteryQuery = cemeteryLat && cemeteryLng
    ? `${cemeteryLat},${cemeteryLng}`
    : `${vault.cemetery_name ?? ''} ${vault.cemetery_address ?? ''}`.trim() || null

  const cemeteryMapUrl = cemeteryQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cemeteryQuery)}`
    : null
  const cemeteryDirectionsUrl = cemeteryQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cemeteryQuery)}`
    : null

  const hasStory = !!vault.biography || !!vault.profession || !!vault.hobbies || !!vault.favorite_song_url || !!vault.donation_preference
  const hasPhotos = photos.length > 0
  const hasVideos = videos.length > 0
  const hasAudio = audioRecordings.length > 0
  const hasTimeline = allMemories.some((memory) => memory.section === 'kronoloji')
  const featuredMemories = allMemories.filter((memory) => memory.section === 'featured')
  const regularMemories = allMemories.filter((memory) => !memory.section || memory.section === 'genel' || memory.section === 'general')
  const hasFeatured = featuredMemories.length > 0
  const hasRegularMemories = regularMemories.length > 0
  const hasFamilyMembers = familyMembers.length > 0
  const hasCemetery = Boolean(vault.cemetery_name)

  const tabs = [
    { href: '#hikaye', label: 'Hayat Hikayesi', show: hasStory },
    { href: '#kronoloji', label: 'Kronoloji', show: hasTimeline },
    { href: '#videolar', label: 'Videolar', show: hasVideos },
    { href: '#fotograflar', label: 'Fotoğraflar', show: hasPhotos },
    { href: '#son-mesaj', label: 'Son Mesaj', show: Boolean(vault.last_message) },
    { href: '#anilar', label: 'Anılar', show: hasRegularMemories },
    { href: '#taziye', label: 'Taziye', show: true },
    { href: '#ziyaret', label: 'Ziyaret', show: hasCemetery },
  ].filter((tab) => tab.show)

  const stats = [
    { label: 'Yıl', value: yearsLived, detail: 'Yaşam süresi' },
    { label: 'Anı', value: allMemories.length || null, detail: 'Toplam hikaye' },
    { label: 'Fotoğraf', value: photos.length || null, detail: 'Paylaşılan kare' },
    { label: 'Aile', value: familyMembers.length || null, detail: 'Yakın bağ' },
  ].filter((item) => item.value !== null)

  const heroCta = vault.tagline ?? 'Sevdiklerinin anısını saygıyla yaşatan bir sayfa.'
  const vaultInitial = vault.display_name?.[0]?.toUpperCase() ?? 'A'
  const turnstileSiteKey = await getTurnstileSiteKey()

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#173d31]">
      {isPreview && (
        <div className="bg-[#d7b56d] px-4 py-2 text-center text-sm font-semibold text-[#102d24]">
          Önizleme modu: Bu sayfa henüz yayınlanmamış. Bağlantıya sahip kişiler görüntüleyebilir.
        </div>
      )}

      <nav className="sticky top-0 z-40 border-b border-[#e6dccb]/50 bg-[#fbf8f1]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="text-xs uppercase tracking-[0.3em] text-[#8a7a64]">Dijital Anma Profili</div>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-[#102f25] text-white">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={vault.display_name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(24,77,56,0.9),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#102f25]/90 via-[#102f25]/70 to-[#fbf8f1]/0" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_540px] lg:py-24">
          <div className="space-y-8">
            <div className="max-w-3xl rounded-3xl border border-white/10 bg-[#0d322a]/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-lg">
              <span className="inline-flex rounded-full bg-[#c7a76f]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#eae0c2]">
                Anma sayfası
              </span>
              <h1 className="mt-6 text-5xl font-serif leading-tight text-white sm:text-6xl">
                {vault.display_name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#e4dbc4]">
                {heroCta}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm uppercase tracking-[0.3em] text-[#c7a76f]/90">Doğum</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{introYear}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm uppercase tracking-[0.3em] text-[#c7a76f]/90">Vefat</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{closingYear}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm uppercase tracking-[0.3em] text-[#c7a76f]/90">Son Söz</div>
                  <div className="mt-3 text-lg text-[#f7f3e5]">{vault.last_message ? 'Mevcut' : 'Henüz yok'}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {tabs.slice(0, 3).map((tab) => (
                <a
                  key={tab.href}
                  href={tab.href}
                  className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#c7a76f]/20"
                >
                  {tab.label}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-white/10 bg-[#0f342d]/95 p-8 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#c7a76f]/20 text-2xl font-bold text-[#f2e7bf]">
                  {vaultInitial}
                </div>
                <div>
                  <div className="text-sm uppercase tracking-[0.25em] text-[#c7a76f]/80">Anma adı</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{vault.display_name}</div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-[0.3em] text-[#c7a76f]/80">Sevgi cümlesi</div>
                  <p className="mt-3 text-sm leading-7 text-[#e5ddc9]">{vault.tagline ?? 'Sessiz bir anı, sıcak bir hatıra.'}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-[0.3em] text-[#c7a76f]/80">Memleket</div>
                  <p className="mt-3 text-sm leading-7 text-[#e5ddc9]">{vault.birth_place ?? 'Bilinmiyor'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center">
                <div className="text-sm uppercase tracking-[0.25em] text-[#c7a76f]/80">Anı sayısı</div>
                <div className="mt-3 text-4xl font-semibold text-white">{allMemories.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center">
                <div className="text-sm uppercase tracking-[0.25em] text-[#c7a76f]/80">Aile bağı</div>
                <div className="mt-3 text-4xl font-semibold text-white">{familyMembers.length}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <div className="flex items-center gap-3 text-[#c7a76f]">
                <PenLine className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.25em]">Kısa not</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#e4dac0]">
                {vault.biography ? splitParagraphs(vault.biography)[0] : 'Burada onun en özel sözü yer alabilir.'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[#173d31] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-7xl grid gap-4 sm:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="text-3xl font-semibold text-white">{item.value}</div>
              <div className="mt-2 text-sm uppercase tracking-[0.25em] text-[#c7a76f]">{item.label}</div>
              <div className="mt-3 text-xs text-[#d8cfa5]">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {tabs.length > 0 && (
        <nav id="sekmeler" className="sticky top-16 z-30 border-b border-[#e6dccb] bg-[#fbf8f1]/96 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 py-3 sm:px-8">
            {tabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="shrink-0 rounded-full border border-[#d7c7ae] bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#173d31] transition hover:bg-[#c7a76f]/10"
              >
                {tab.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {hasStory && (
        <section id="hikaye" className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3 text-[#b08340]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs uppercase tracking-[0.2em]">Hayat Hikayesi</span>
              </div>
              <h2 className="mt-3 text-5xl font-serif text-[#173d31]">
                Bir yaşamın<br />
                <span className="text-[#b08340]">hikayesi.</span>
              </h2>
              {vault.biography ? (
                <div className="mt-8 space-y-5 text-base leading-8 text-[#4c463c]">
                  {splitParagraphs(vault.biography).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-8 max-w-2xl text-base leading-8 text-[#4c463c]">
                  Bu bölge, hayatına dair izleri ve onu özel kılan detayları toplar.
                </p>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/10">
                <div className="flex items-center gap-3 text-[#b08340]">
                  <span className="h-px w-8 bg-[#c7a76f]" />
                  <span className="text-xs uppercase tracking-[0.2em]">Kişisel Bilgiler</span>
                </div>
                <div className="mt-6 grid gap-4">
                  {vault.profession && (
                    <div className="rounded-2xl border border-[#eadfca] bg-[#fbf8f1] p-4">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#8a7a64]">Meslek</div>
                      <div className="mt-2 font-serif text-lg text-[#173d31]">{vault.profession}</div>
                    </div>
                  )}
                  {vault.hobbies && (
                    <div className="rounded-2xl border border-[#eadfca] bg-[#fbf8f1] p-4">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#8a7a64]">Hobileri</div>
                      <div className="mt-2 text-sm leading-6 text-[#4c463c]">{vault.hobbies}</div>
                    </div>
                  )}
                </div>
              </div>

              {vault.favorite_song_url && (
                <div className="rounded-3xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/10">
                  <div className="flex items-center gap-3 text-[#b08340]">
                    <span className="h-px w-8 bg-[#c7a76f]" />
                    <span className="text-xs uppercase tracking-[0.2em]">Favori Şarkı</span>
                  </div>
                  <div className="mt-5 rounded-2xl border border-[#eadfca] bg-[#fbf8f1] p-4">
                    <div className="font-serif text-lg text-[#173d31]">{vault.favorite_song_title ?? 'Sevdiği şarkı'}</div>
                    <audio controls src={vault.favorite_song_url} className="mt-4 w-full" />
                  </div>
                </div>
              )}

              {vault.donation_preference && (
                <div className="rounded-3xl border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg shadow-[#4d3d26]/10">
                  <div className="flex items-center gap-3 text-[#b08340]">
                    <span className="h-px w-8 bg-[#c7a76f]" />
                    <span className="text-xs uppercase tracking-[0.2em]">Bağış Yönlendirmesi</span>
                  </div>
                  <p className="mt-5 rounded-2xl border border-[#eadfca] bg-[#fbf8f1] px-4 py-3 text-sm leading-7 text-[#4c463c]">
                    {vault.donation_preference}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      {hasTimeline && (
        <section id="kronoloji" className="border-y border-[#172d25] bg-[#091712] px-5 py-16 text-[#efe7d8] sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3 text-[#c7a76f]">
                  <span className="h-px w-10 bg-[#c7a76f]" />
                  <span className="text-xs uppercase tracking-[0.2em]">Yaşam Kronolojisi</span>
                </div>
                <h2 className="mt-3 text-5xl font-serif text-white">Zaman Yolculuğu</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#b8aa93]">
                  Önemli anlara bir yolculuk.{yearsLived !== null ? ` ${yearsLived} yıllık hayat.` : ''}
                </p>
              </div>
            </div>

            <TimelineSection
              events={allMemories
                .filter((event) => event.section === 'kronoloji')
                .map((event) => ({
                  id: event.id,
                  year: event.memory_date ? formatDate(event.memory_date, { year: 'numeric' }) : null,
                  title: event.title ?? null,
                  content: event.content ?? null,
                  media_url: event.media_url ?? null,
                }))}
            />
          </div>
        </section>
      )}

      {hasVideos && (
        <section id="videolar" className="bg-[#0c3327] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <div className="flex items-center gap-3 text-[#c7a76f]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs uppercase tracking-[0.2em]">Video Anılar</span>
              </div>
              <h2 className="mt-3 text-5xl font-serif text-white">Hareket eden anlar</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
              {(videos[0] ?? null) && (() => {
                const video = videos[0]
                const embed = getVideoEmbed(video.original_url)
                const thumb = getVideoThumb(video.original_url, video.thumb_url)
                return (
                  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#173d31] shadow-xl shadow-black/20">
                    {embed ? (
                      <div className="aspect-video">
                        <iframe src={embed} className="h-full w-full" allowFullScreen title={video.original_filename ?? 'Video'} />
                      </div>
                    ) : (
                      <div className="aspect-video bg-black">
                        <video controls src={video.original_url} poster={thumb ?? undefined} className="h-full w-full" preload="metadata" />
                      </div>
                    )}
                    {video.caption && <div className="p-5 text-sm text-[#b8aa93]">{video.caption}</div>}
                  </div>
                )
              })()}

              <div className="grid gap-4">
                {videos.slice(1).map((video) => {
                  const embed = getVideoEmbed(video.original_url)
                  const thumb = getVideoThumb(video.original_url, video.thumb_url)
                  return (
                    <div key={video.id} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#152a22] shadow-lg shadow-black/20">
                      {embed ? (
                        <div className="aspect-video">
                          <iframe src={embed} className="h-full w-full" allowFullScreen title={video.original_filename ?? ''} />
                        </div>
                      ) : (
                        <div className="aspect-video bg-black">
                          <video controls src={video.original_url} poster={thumb ?? undefined} className="h-full w-full" preload="metadata" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {hasPhotos && (
        <section id="fotograflar" className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 text-[#b08340]">
                  <span className="h-px w-10 bg-[#c7a76f]" />
                  <span className="text-xs uppercase tracking-[0.2em]">Fotoğraf Arşivi</span>
                </div>
                <h2 className="mt-3 text-5xl font-serif text-[#173d31]">Donmuş anlar</h2>
              </div>
              <span className="text-sm text-[#8a7a64]">{photos.length} fotoğraf</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="group overflow-hidden rounded-[2rem] border border-[#e1d5c3] bg-[#fffdf8] shadow-sm transition hover:shadow-md">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={photo.thumb_url ?? photo.original_url}
                      alt={photo.original_filename ?? 'Fotoğraf'}
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  {(photo.caption || photo.original_filename) && (
                    <div className="p-4 text-sm text-[#4c463c]">{photo.caption ?? photo.original_filename}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {vault.last_message && (
        <section id="son-mesaj" className="border-y border-[#e6dccb] bg-[#f7f2e9] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs uppercase tracking-[0.2em]">Bıraktığı Son Mesaj</span>
            </div>
            <h2 className="mt-3 text-5xl font-serif text-[#173d31]">Kalpten uzanan satırlar</h2>
          </div>

          <div className="relative mx-auto mt-12 max-w-2xl">
            <div className="absolute -left-5 -top-5 text-[120px] font-serif text-[#c7a76f]/15">“</div>
            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7c7ae] bg-[#fffdf6] shadow-2xl shadow-[#4d3d26]/12">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#c7a76f]/60 to-transparent" />
              <div className="p-10">
                <Feather className="mx-auto mb-6 h-8 w-8 text-[#b08340]/60" />
                <div className="space-y-5 font-serif text-xl italic leading-9 text-[#4c463c]">
                  {vault.last_message.split('\n').filter(Boolean).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-[#e1d5c3] pt-6">
                  <div>
                    <div className="font-serif text-2xl text-[#173d31]">{vault.display_name}</div>
                    {vault.death_place && <div className="text-xs text-[#8a7a64]">{vault.death_place}</div>}
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#c7a76f]/30 bg-[#f4eee3] text-[#b08340]">
                    {vaultInitial}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasAudio && (
        <AudioPlayerSection
          recordings={audioRecordings.map((recording) => ({
            id: recording.id,
            title: recording.title ?? 'Ses Kaydı',
            author: recording.author,
            audio_url: recording.audio_url,
          }))}
        />
      )}

      {hasFeatured && (
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <div className="flex items-center justify-center gap-3 text-[#b08340]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs uppercase tracking-[0.2em]">Öne Çıkan Anılar</span>
              </div>
              <h2 className="mt-3 text-5xl font-serif text-[#173d31]">Sevenlerinin sözleri</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {featuredMemories.map((memory) => (
                <div key={memory.id} className="group overflow-hidden rounded-[2rem] border border-[#e1d5c3] bg-[#fffdf8] p-6 shadow-lg transition hover:shadow-xl">
                  <div className="absolute right-6 top-5 text-7xl font-serif text-[#f4eee3]">“</div>
                  <Heart className="mb-5 h-6 w-6 text-[#b08340]/60" />
                  <p className="relative z-10 text-lg italic leading-8 text-[#4c463c]">{memory.content}</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-[#e1d5c3] pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eee3] text-[#b08340]">
                      {memory.title?.[0] ?? '?'}
                    </div>
                    <div>
                      <div className="font-serif text-base text-[#173d31]">{memory.title}</div>
                      {memory.memory_date && (
                        <div className="text-xs text-[#8a7a64]">{formatDate(memory.memory_date, { year: 'numeric', month: 'long' })}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasRegularMemories && (
        <section id="anilar" className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#b08340]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs uppercase tracking-[0.2em]">Anılar</span>
            </div>
            <h2 className="mb-8 text-4xl font-serif text-[#173d31]">Sevenlerinin bıraktığı izler</h2>
            <div className="space-y-4">
              {regularMemories.map((memory) => {
                const embedUrl = memory.media_type === 'video' && memory.media_url ? getVideoEmbed(memory.media_url) : null
                return (
                  <article key={memory.id} className="group overflow-hidden rounded-[2rem] border border-[#e1d5c3] bg-[#fffdf8] shadow-sm transition hover:shadow-md">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
                      {(memory.media_type === 'image' && memory.media_url) && (
                        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-3xl border border-[#e1d5c3] bg-[#f4eee3] sm:w-32 sm:h-24">
                          <Image src={memory.media_url} alt={memory.title ?? 'Anı'} fill sizes="96px" className="object-cover" unoptimized />
                        </div>
                      )}
                      {embedUrl && (
                        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-3xl border border-[#e1d5c3] bg-[#000] sm:w-40 sm:h-24">
                          <iframe src={embedUrl} className="h-full w-full" allowFullScreen title={memory.title ?? ''} />
                        </div>
                      )}
                      {memory.media_type === 'video' && memory.media_url && !embedUrl && (
                        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-3xl border border-[#e1d5c3] bg-black sm:w-40 sm:h-24">
                          <video controls src={memory.media_url} className="h-full w-full object-cover" preload="metadata" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {memory.memory_date && (
                          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#b08340]">{formatDate(memory.memory_date, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        )}
                        {memory.title && <h3 className="mb-2 text-lg font-semibold text-[#173d31]">{memory.title}</h3>}
                        <p className="text-sm leading-7 text-[#4c463c] line-clamp-3">{memory.content}</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <div id="taziye">
        <RealMemorialInteractionsWrapper entries={guestbookEntries} vaultId={id} initialCounts={{
          candle: reactionData.filter((r) => r.reaction_type === 'candle').length,
          flower: reactionData.filter((r) => r.reaction_type === 'flower').length,
          prayer: reactionData.filter((r) => r.reaction_type === 'prayer').length,
        }} siteKey={turnstileSiteKey} />
      </div>

      {hasFamilyMembers && (
        <section id="aile-baglari" className="bg-[#091712] px-5 py-12 text-[#efe7d8] sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-9 text-center lg:text-left">
              <div className="flex items-center justify-center gap-3 text-[#c7a76f] lg:justify-start">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs uppercase tracking-[0.2em]">Aile Bağları</span>
              </div>
              <h2 className="mt-3 text-4xl font-serif text-white sm:text-5xl">Köklerden yeni nesillere</h2>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1412] shadow-2xl shadow-black/30 p-4 sm:p-6">
              <div className="relative pointer-events-none inset-0 bg-[radial-gradient(circle_at_center,rgba(199,167,111,0.1),transparent_45%)]" />
              <div className="relative">
                <FamilyTreeCanvas
                  vault={{
                    display_name: vault.display_name,
                    cover_photo_url: vault.cover_photo_url,
                    birth_date: vault.birth_date,
                    death_date: vault.death_date,
                  }}
                  members={familyMembers.map((member) => ({
                    id: member.id,
                    full_name: member.full_name,
                    relationship: member.relationship ?? 'other',
                    photo_url: member.photo_url,
                    birth_date: member.birth_date,
                    death_date: member.death_date,
                    is_alive: member.is_alive ?? true,
                    parent_member_id: member.parent_member_id,
                  }))}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {hasCemetery && (
        <section id="ziyaret" className="border-t border-[#e6dccb] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <div className="flex items-center gap-3 text-[#b08340]">
                <span className="h-px w-10 bg-[#c7a76f]" />
                <span className="text-xs uppercase tracking-[0.2em]">Ziyaret Bilgisi</span>
              </div>
              <h2 className="mt-3 text-5xl font-serif text-[#173d31]">Bir ziyaret daha</h2>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#e1d5c3] shadow-xl shadow-[#4d3d26]/8">
              <div className="grid bg-[#fffdf8] lg:grid-cols-[1fr_1.5fr]">
                <div className="space-y-6 border-b border-[#e1d5c3] p-7 lg:border-b-0 lg:border-r">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#8a7a64]">Mezarlık</div>
                    <div className="mt-2 text-xl font-serif text-[#173d31]">{vault.cemetery_name}</div>
                    {vault.cemetery_address && <div className="mt-1 text-sm text-[#8a7a64]">{vault.cemetery_address}</div>}
                  </div>

                  {vault.cemetery_plot && (
                    <div className="rounded-2xl border border-[#e1d5c3] bg-[#faf5eb] p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7a64]">Ada / Parsel</div>
                      <div className="mt-1 font-serif text-base text-[#173d31]">{vault.cemetery_plot}</div>
                    </div>
                  )}
                  {vault.cemetery_row && (
                    <div className="rounded-2xl border border-[#e1d5c3] bg-[#faf5eb] p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7a64]">Sıra / Numara</div>
                      <div className="mt-1 font-serif text-base text-[#173d31]">{vault.cemetery_row}</div>
                    </div>
                  )}
                  {vault.cemetery_hours && (
                    <div className="rounded-2xl border border-[#e1d5c3] bg-[#faf5eb] p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7a64]">Ziyaret Saatleri</div>
                      <div className="mt-1 font-serif text-base text-[#173d31]">{vault.cemetery_hours}</div>
                    </div>
                  )}
                  {vault.death_place && (
                    <div className="rounded-2xl border border-[#e1d5c3] bg-[#faf5eb] p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a7a64]">Vefat Yeri</div>
                      <div className="mt-1 font-serif text-base text-[#173d31]">{vault.death_place}</div>
                    </div>
                  )}
                  {vault.cemetery_note && (
                    <div className="rounded-2xl border border-[#e1d5c3] bg-[#f7f2e9] p-4">
                      <p className="text-sm leading-6 text-[#5b5245]"><span className="font-semibold text-[#173d31]">Not:</span> {vault.cemetery_note}</p>
                    </div>
                  )}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {cemeteryDirectionsUrl && (
                      <a href={cemeteryDirectionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#174f35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123f2b]">
                        <Navigation className="h-4 w-4" /> Yol Tarifi
                      </a>
                    )}
                    {cemeteryMapUrl && (
                      <a href={cemeteryMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e1d5c3] bg-white px-4 py-3 text-sm font-semibold text-[#174f35] transition hover:bg-[#f7f2e9]">
                        <MapPin className="h-4 w-4" /> Haritada Aç
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative min-h-[320px] overflow-hidden bg-[#f7f2e9]">
                  {(cemeteryLat && cemeteryLng) || vault.cemetery_name ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(cemeteryQuery ?? '')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
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

      <footer className="bg-[#0c3327] px-5 py-12 text-[#efe7d8] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandLogo light />
            <p className="mt-4 max-w-xs font-serif text-lg italic leading-7 text-[#cfc3ad]">
              Anılar yaşar, büyük sevgiler sonsuzdur.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg text-white">Platform</h3>
            <div className="mt-4 space-y-2">
              <Link href="/" className="block text-sm text-[#cfc3ad] transition hover:text-white">Ana Sayfa</Link>
              <Link href="/memorial/demo" className="block text-sm text-[#cfc3ad] transition hover:text-white">Örnek Profil</Link>
              <Link href="/pricing" className="block text-sm text-[#cfc3ad] transition hover:text-white">Fiyatlandırma</Link>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-lg text-white">Belgeler</h3>
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
