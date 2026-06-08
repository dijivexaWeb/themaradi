import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Feather, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas'

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

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vim = url.match(/vimeo\.com\/(\d+)/)
  if (vim) return `https://player.vimeo.com/video/${vim[1]}`
  return null
}

export default async function RealMemorialPage({ vault, isPreview = false }: Props) {
  const id = vault.id
  const supabase = await createClient()

  const [
    { data: photos },
    { data: videos },
    { data: memories },
    { data: familyMembers },
  ] = await Promise.all([
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'image').eq('is_public', true).order('taken_at', { ascending: false }).limit(24),
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'video').eq('is_public', true).order('taken_at', { ascending: false }).limit(6),
    supabase.from('vault_memories').select('*').eq('vault_id', id).eq('is_secret', false).order('memory_date', { ascending: false }),
    supabase.from('vault_family_members').select('*').eq('vault_id', id).order('sort_order'),
  ])

  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null
  const yearsLived = birthYear && deathYear ? deathYear - birthYear : null
  const daysSince = vault.death_date
    ? Math.floor((Date.now() - new Date(vault.death_date).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const vaultInitial = vault.display_name?.[0]?.toUpperCase() ?? '?'
  const vaultYears = [birthYear, deathYear].filter(Boolean).join(' – ')

  const hasFamilyMembers = (familyMembers?.length ?? 0) > 0

  return (
    <div className="min-h-screen bg-[#0c3327] text-[#efe7d8]">

      {/* ── Preview banner ── */}
      {isPreview && (
        <div className="bg-[#c7a76f] px-4 py-2 text-center text-xs font-semibold text-[#091712]">
          Önizleme Modu — Bu sayfa henüz yayınlanmamış
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-[#c7a76f]/10 bg-[#0c3327]/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/"><BrandLogo light /></Link>
          <div className="text-xs text-[#c7a76f]/60">Dijital Anma Profili</div>
        </div>
      </nav>

      {/* ── Hero (3-column layout matching demo) ── */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-[#0c3327]">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#091712]/60 via-[#0c3327]/50 to-[#0c3327]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-5 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_380px_1fr] lg:gap-10 lg:py-20">

          {/* Left panel — Ailesinden */}
          <div className="order-2 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6 lg:order-1">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.22em] uppercase">Ailesinden</span>
            </div>
            <p className="font-serif text-lg leading-8 text-white sm:text-xl sm:leading-9">
              {vault.tagline
                ? vault.tagline
                : 'Saygıyla anıyoruz. Bize bıraktığı sevgi ve hatıralar her zaman kalbimizde yaşayacak.'}
            </p>
            <a href="#taziye"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c7a76f] px-4 py-2.5 text-xs font-semibold text-[#0c3327] transition hover:bg-[#d4b87c]">
              Anı Defteri
              <PenLine className="h-4 w-4" />
            </a>
          </div>

          {/* Center — Portrait + Name + Stats */}
          <div className="order-1 text-center lg:order-2">
            <div className="mx-auto mb-5 flex w-fit items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.25em] uppercase">Dijital Anıt Profili</span>
              <span className="h-px w-8 bg-[#c7a76f]" />
            </div>

            {vault.cover_photo_url ? (
              <div className="relative mx-auto h-[210px] w-[210px] overflow-hidden rounded-full border-[5px] border-[#c7a76f]/35 bg-[#0c3327] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:h-[280px] sm:w-[280px]">
                <Image src={vault.cover_photo_url} alt={vault.display_name} fill priority sizes="280px" className="object-cover object-top" unoptimized />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
              </div>
            ) : (
              <div className="mx-auto mb-4 flex h-[210px] w-[210px] items-center justify-center rounded-full border-[5px] border-[#c7a76f]/35 bg-[#091712] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:h-[280px] sm:w-[280px]">
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
              <p className="mt-1.5 text-xs text-[#c7a76f]/60">📍 {vault.birth_place}</p>
            )}

            {/* Stats */}
            {(yearsLived !== null || daysSince !== null) && (
              <div className="mt-5 space-y-3 sm:mt-6">
                <div className="grid grid-cols-2 gap-3">
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
                  <div className="rounded-xl border border-[#c7a76f]/25 bg-white/5 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#c7a76f] backdrop-blur-sm sm:py-3 sm:text-xs">
                    Ebediyete yürüyeli
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel — Son Mesaj */}
          <div className="order-3 rounded-2xl border border-[#c7a76f]/20 bg-[#091712]/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-3 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-8 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.22em] uppercase">Ondan kalan söz</span>
            </div>
            <div className="font-serif text-5xl leading-none text-[#c7a76f]/35">&ldquo;</div>
            <p className="mt-1 font-serif text-lg italic leading-8 text-white sm:text-xl sm:leading-9">
              {vault.last_message
                ? vault.last_message
                : 'Bu kişi için henüz bir son mesaj eklenmemiş.'}
            </p>
            <a href="#anilara-git"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#c7a76f]/40 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10">
              Anıları Keşfet
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

        </div>
      </section>

      {/* ── Life stats bar (matching demo) ── */}
      {(yearsLived !== null || (memories?.length ?? 0) > 0 || hasFamilyMembers || (photos?.length ?? 0) > 0) && (
        <section className="bg-[#173d31] px-5 py-0 sm:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#2a5a45] sm:grid-cols-4 sm:divide-y-0">
            {yearsLived !== null && (
              <div className="px-6 py-5 text-center sm:px-8 sm:py-6">
                <div className="font-serif text-3xl text-white">{yearsLived}</div>
                <div className="mt-1 text-xs text-[#c7a76f]">yıl</div>
                <div className="mt-0.5 text-[11px] text-[#cfc3ad]/60">Bereketli bir ömür</div>
              </div>
            )}
            {(memories?.length ?? 0) > 0 && (
              <div className="px-6 py-5 text-center sm:px-8 sm:py-6">
                <div className="font-serif text-3xl text-white">{memories!.length}</div>
                <div className="mt-1 text-xs text-[#c7a76f]">anı</div>
                <div className="mt-0.5 text-[11px] text-[#cfc3ad]/60">Paylaşılan hatıra</div>
              </div>
            )}
            {hasFamilyMembers && (
              <div className="px-6 py-5 text-center sm:px-8 sm:py-6">
                <div className="font-serif text-3xl text-white">{familyMembers!.length}</div>
                <div className="mt-1 text-xs text-[#c7a76f]">kişi</div>
                <div className="mt-0.5 text-[11px] text-[#cfc3ad]/60">Aile ağacı</div>
              </div>
            )}
            {(photos?.length ?? 0) > 0 && (
              <div className="px-6 py-5 text-center sm:px-8 sm:py-6">
                <div className="font-serif text-3xl text-white">{photos!.length}</div>
                <div className="mt-1 text-xs text-[#c7a76f]">fotoğraf</div>
                <div className="mt-0.5 text-[11px] text-[#cfc3ad]/60">Arşivlenen an</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Biography ── */}
      {vault.biography && (
        <section className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Hayat Hikayesi</span>
            </div>
            <h2 className="mb-7 font-serif text-4xl text-white sm:text-5xl">
              Bir insanın<br />
              <span className="text-[#c7a76f]">dolu dolu hayatı.</span>
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] p-6 shadow-xl shadow-black/20 sm:p-8">
              <p className="whitespace-pre-wrap text-sm leading-8 text-[#cfc3ad] sm:text-base">
                {vault.biography}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Last message (full section) ── */}
      {vault.last_message && (
        <section id="son-mesaj" className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Bıraktığı Son Mesaj</span>
            </div>
            <h2 className="mb-7 font-serif text-4xl text-white sm:text-5xl">
              Hayattayken<br />
              <span className="text-[#c7a76f]">sevdiklerine bıraktığı satırlar.</span>
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[#c7a76f]/20 bg-[#0d1412] p-6 shadow-xl shadow-black/20 sm:p-10">
              <div className="mb-3 font-serif text-6xl leading-none text-[#c7a76f]/15">&ldquo;</div>
              <p className="font-serif text-lg italic leading-10 text-[#efe7d8] sm:text-2xl">
                {vault.last_message}
              </p>
              <div className="mt-3 rotate-180 text-right font-serif text-6xl leading-none text-[#c7a76f]/15">&ldquo;</div>
            </div>
          </div>
        </section>
      )}

      {/* ── Aile Bağları ── */}
      {hasFamilyMembers && (
        <section id="aile-baglari" className="bg-[#091712] px-5 py-12 text-[#efe7d8] sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-9 flex flex-col gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 text-[#c7a76f]">
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
                    members={(familyMembers ?? []).map(m => ({
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

      {/* ── Memories ── */}
      {(memories?.length ?? 0) > 0 && (
        <section id="anilara-git" className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Anılar</span>
            </div>
            <h2 className="mb-7 font-serif text-4xl text-white sm:text-5xl">
              Sevenlerinin<br />
              <span className="text-[#c7a76f]">bıraktığı izler.</span>
            </h2>
            <div className="space-y-4">
              {memories!.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-xl shadow-black/20">
                  {m.media_type === 'image' && m.media_url && (
                    <div className="relative w-full">
                      <Image src={m.media_url} alt={m.title ?? 'Anı'} width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }} className="rounded-t-2xl" unoptimized />
                    </div>
                  )}
                  {m.media_type === 'video' && m.media_url && (() => {
                    const embed = getVideoEmbed(m.media_url)
                    return embed ? (
                      <div className="aspect-video">
                        <iframe src={embed} className="h-full w-full" allowFullScreen title={m.title ?? 'Video'} />
                      </div>
                    ) : null
                  })()}
                  <div className="p-5">
                    {m.memory_date && (
                      <p className="mb-2 text-xs font-semibold tracking-wide text-[#c7a76f]">
                        {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    {m.title && <h3 className="mb-2 font-serif text-lg text-white">{m.title}</h3>}
                    <p className="text-sm leading-7 text-[#cfc3ad]">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Videos ── */}
      {(videos?.length ?? 0) > 0 && (
        <section className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Video Anılar</span>
            </div>
            <h2 className="mb-7 font-serif text-4xl text-white sm:text-5xl">
              Hareket eden<br />
              <span className="text-[#c7a76f]">anlar.</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {videos!.map((v) => {
                const embed = getVideoEmbed(v.original_url)
                return (
                  <div key={v.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] shadow-xl shadow-black/20">
                    {embed ? (
                      <div className="aspect-video"><iframe src={embed} className="h-full w-full" allowFullScreen title={v.original_filename ?? 'Video'} /></div>
                    ) : (
                      <a href={v.original_url} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center bg-[#0d1412] text-[#c7a76f]">
                        <span className="text-4xl">▶️</span>
                      </a>
                    )}
                    {(v.original_filename || v.caption) && (
                      <div className="p-4">
                        {v.original_filename && <p className="text-sm font-medium text-[#efe7d8]">{v.original_filename}</p>}
                        {v.caption && <p className="mt-1 text-xs leading-5 text-[#8f9f96]">{v.caption}</p>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Photos ── */}
      {(photos?.length ?? 0) > 0 && (
        <section className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Fotoğraf Arşivi ({photos!.length})</span>
            </div>
            <h2 className="mb-7 font-serif text-4xl text-white sm:text-5xl">
              Donmuş anlar,<br />
              <span className="text-[#c7a76f]">canlı hatıralar.</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos!.map((p) => (
                <div key={p.id} className="group overflow-hidden rounded-xl border border-white/10 bg-[#0d1412]">
                  <div className="relative aspect-square">
                    <Image src={p.thumb_url ?? p.original_url} alt={p.original_filename ?? ''} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                  </div>
                  {p.caption && (
                    <div className="p-2"><p className="line-clamp-2 text-xs leading-5 text-[#8f9f96]">{p.caption}</p></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Cemetery ── */}
      {vault.cemetery_name && (
        <section className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3 text-[#c7a76f]">
              <span className="h-px w-10 bg-[#c7a76f]" />
              <span className="text-xs tracking-[0.2em] uppercase">Ziyaret Bilgisi</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1412] p-6 shadow-xl shadow-black/20">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🪦</span>
                <div>
                  <p className="font-serif text-xl text-white">{vault.cemetery_name}</p>
                  {vault.cemetery_address && <p className="mt-2 text-sm leading-6 text-[#cfc3ad]">{vault.cemetery_address}</p>}
                  {vault.death_place && <p className="mt-1 text-xs text-[#c7a76f]/60">📍 {vault.death_place}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-[#0c3327] px-5 py-10 text-center sm:px-8">
        <p className="font-serif text-sm italic text-[#cfc3ad]">Anılar yaşar, büyük sevgi sonsuzdur.</p>
        <p className="mt-3 text-xs text-[#c7a76f]/40">Bu sayfa The Maradi platformu üzerinde oluşturulmuştur.</p>
        <Link href="/" className="mt-1 inline-block text-xs text-[#c7a76f]/60 transition-colors hover:text-[#c7a76f]">themaradi.com →</Link>
      </footer>

    </div>
  )
}
