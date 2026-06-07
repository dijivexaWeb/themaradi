import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'

const REL_LABELS: Record<string, string> = {
  mother: 'Annesi', father: 'Babası', spouse: 'Eşi', son: 'Oğlu',
  daughter: 'Kızı', sibling: 'Kardeşi', grandparent: 'Büyükanne/Büyükbaba',
  grandchild: 'Torunu', other: 'Diğer',
}

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
}

export default async function RealMemorialPage({ vault }: Props) {
  const id = vault.id as string
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

  const birthYear = vault.birth_date ? new Date(vault.birth_date as string).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date as string).getFullYear() : null
  const daysSince = vault.death_date
    ? Math.floor((Date.now() - new Date(vault.death_date as string).getTime()) / (1000 * 60 * 60 * 24))
    : null

  function getVideoEmbed(url: string): string | null {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    const vim = url.match(/vimeo\.com\/(\d+)/)
    if (vim) return `https://player.vimeo.com/video/${vim[1]}`
    return null
  }

  return (
    <div className="min-h-screen bg-[#0c3327] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#0c3327]/90 backdrop-blur border-b border-[#c7a76f]/10 px-5 py-3 flex items-center justify-between">
        <Link href="/">
          <BrandLogo light />
        </Link>
        <div className="text-xs text-[#c7a76f]/60">Dijital Anma Platformu</div>
      </nav>

      {/* Hero */}
      <div className="relative px-5 py-16 sm:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#082b1f] via-[#0c3327] to-[#0c3327]" />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-[#c7a76f] text-xs tracking-[0.2em] uppercase mb-6">Dijital Anma Profili</p>

          {vault.cover_photo_url ? (
            <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-[#c7a76f]/50 mx-auto mb-6 relative shadow-2xl">
              <Image
                src={vault.cover_photo_url as string}
                alt={vault.display_name as string}
                fill className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-[#c7a76f]/10 border-4 border-[#c7a76f]/30 mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <span className="text-5xl text-[#c7a76f]/40">👤</span>
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-3">
            {vault.display_name as string}
          </h1>

          {(birthYear || deathYear) && (
            <p className="text-[#c7a76f] text-xl font-serif mb-4 tracking-widest">
              {birthYear ?? '?'} — {deathYear ?? '?'}
            </p>
          )}

          {vault.tagline && (
            <p className="text-[#efe7d8] italic font-serif text-base sm:text-lg leading-9 max-w-lg mx-auto mb-4">
              "{vault.tagline as string}"
            </p>
          )}

          {vault.birth_place && (
            <p className="text-[#c7a76f]/60 text-sm">📍 {vault.birth_place as string}</p>
          )}

          {daysSince !== null && (
            <p className="text-[#c7a76f]/40 text-xs mt-4">Vefatından bu yana {daysSince.toLocaleString('tr-TR')} gün</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-20 space-y-10">
        {/* Biography */}
        {vault.biography && (
          <section className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-2xl p-6 sm:p-8">
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-5">Hayat Hikayesi</p>
            <p className="text-[#cfc3ad] leading-8 text-sm sm:text-base whitespace-pre-wrap">
              {vault.biography as string}
            </p>
          </section>
        )}

        {/* Last message */}
        {vault.last_message && (
          <section className="bg-[#0d1f1a] border border-[#c7a76f]/20 rounded-2xl p-6 sm:p-10">
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-5">Bıraktığı Son Mesaj</p>
            <div className="font-serif text-6xl text-[#c7a76f]/15 leading-none mb-3">"</div>
            <p className="text-[#efe7d8] font-serif text-lg sm:text-2xl leading-10 italic">
              {vault.last_message as string}
            </p>
            <div className="font-serif text-6xl text-[#c7a76f]/15 leading-none text-right mt-3 rotate-180">"</div>
          </section>
        )}

        {/* Family tree */}
        {familyMembers && familyMembers.length > 0 && (
          <section>
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-5">Aile Ağacı</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {familyMembers.map((m) => (
                <div key={m.id} className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-xl p-4 text-center hover:border-[#c7a76f]/25 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-[#c7a76f]/10 mx-auto mb-2 overflow-hidden">
                    {m.photo_url ? (
                      <Image
                        src={m.photo_url} alt={m.full_name}
                        width={56} height={56}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {m.is_alive ? '😊' : '🕯️'}
                      </div>
                    )}
                  </div>
                  <p className="text-white font-medium text-xs leading-4">{m.full_name}</p>
                  <p className="text-[#c7a76f] text-[10px] mt-0.5">{REL_LABELS[m.relationship] ?? m.relationship}</p>
                  {(m.birth_date || m.death_date) && (
                    <p className="text-slate-600 text-[10px] mt-0.5">
                      {m.birth_date ? new Date(m.birth_date).getFullYear() : '?'}
                      {!m.is_alive && m.death_date ? ` – ${new Date(m.death_date).getFullYear()}` : m.is_alive ? ' –' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Memories */}
        {memories && memories.length > 0 && (
          <section>
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-5">Anılar</p>
            <div className="space-y-4">
              {memories.map((m) => (
                <div key={m.id} className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-xl p-5 hover:border-[#c7a76f]/20 transition-colors">
                  {m.title && <h3 className="font-serif text-[#efe7d8] text-lg mb-2">{m.title}</h3>}
                  <p className="text-[#cfc3ad] text-sm leading-7">{m.content}</p>
                  {m.memory_date && (
                    <p className="text-[#c7a76f]/50 text-xs mt-2">
                      {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {videos && videos.length > 0 && (
          <section>
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-5">Videolar</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {videos.map((v) => {
                const embed = getVideoEmbed(v.original_url)
                return (
                  <div key={v.id} className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-xl overflow-hidden">
                    {embed ? (
                      <div className="aspect-video">
                        <iframe src={embed} className="w-full h-full" allowFullScreen title={v.original_filename ?? 'Video'} />
                      </div>
                    ) : (
                      <a href={v.original_url} target="_blank" rel="noopener noreferrer"
                        className="aspect-video flex items-center justify-center bg-[#0d1f1a] text-[#c7a76f] hover:text-[#d4b87c] transition-colors">
                        <span className="text-4xl">▶️</span>
                      </a>
                    )}
                    {v.original_filename && (
                      <p className="text-xs text-[#cfc3ad] px-4 py-2">{v.original_filename}</p>
                    )}
                    {v.taken_at && (
                      <p className="text-[11px] text-[#c7a76f]/70 px-4 pb-1">
                        {new Date(v.taken_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                    {v.caption && (
                      <p className="text-xs text-[#8f826d] px-4 pb-3 leading-5">{v.caption}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Photo gallery */}
        {photos && photos.length > 0 && (
          <section>
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-5">
              Fotoğraf Arşivi ({photos.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="rounded-xl overflow-hidden bg-[#0d1f1a] border border-[#c7a76f]/10 group">
                  <div className="aspect-square relative">
                    <Image
                      src={p.thumb_url ?? p.original_url}
                      alt={p.original_filename ?? ''}
                      fill className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    {p.taken_at && (
                      <p className="text-[11px] text-[#c7a76f]/70 mb-1">
                        {new Date(p.taken_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                    {p.caption && (
                      <p className="text-xs text-[#cfc3ad] leading-5 line-clamp-3">{p.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cemetery */}
        {vault.cemetery_name && (
          <section className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-2xl p-6">
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-3">Mezar Bilgileri</p>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🪦</span>
              <div>
                <p className="text-[#efe7d8] font-medium">{vault.cemetery_name as string}</p>
                {vault.cemetery_address && (
                  <p className="text-[#cfc3ad] text-sm mt-1">{vault.cemetery_address as string}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-[#c7a76f]/10">
          <p className="text-[#c7a76f]/40 text-xs">Bu sayfa The Maradi platformu üzerinde oluşturulmuştur.</p>
          <Link href="/" className="text-[#c7a76f]/60 hover:text-[#c7a76f] text-xs mt-1 inline-block transition-colors">
            themaradi.com →
          </Link>
        </div>
      </div>
    </div>
  )
}
