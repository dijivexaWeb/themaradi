import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Props { params: Promise<{ id: string }> }

const REL_LABELS: Record<string, string> = {
  mother: 'Annesi', father: 'Babası', spouse: 'Eşi', son: 'Oğlu',
  daughter: 'Kızı', sibling: 'Kardeşi', grandparent: 'Büyükanne/Büyükbaba',
  grandchild: 'Torunu', other: 'Diğer',
}

export default async function OnizlemePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('*').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const [
    { data: photos },
    { data: videos },
    { data: memories },
    { data: familyMembers },
    { data: secretCount },
  ] = await Promise.all([
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'image').eq('is_public', true).order('taken_at', { ascending: false }).limit(12),
    supabase.from('media').select('*').eq('vault_id', id).eq('media_type', 'video').eq('is_public', true).limit(4),
    supabase.from('vault_memories').select('*').eq('vault_id', id).eq('is_secret', false).order('memory_date', { ascending: false }).limit(5),
    supabase.from('vault_family_members').select('*').eq('vault_id', id).order('sort_order'),
    supabase.from('vault_memories').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('is_secret', true),
  ])

  const isLifeVault = vault.product_type === 'life_vault'
  const birthYear = vault.birth_date ? new Date(vault.birth_date).getFullYear() : null
  const deathYear = vault.death_date ? new Date(vault.death_date).getFullYear() : null

  return (
    <div className="min-h-screen bg-[#0c3327] text-white">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-amber-500 text-[#0c3327] px-4 py-2.5 flex items-center justify-between text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span>👁️</span>
          <span>ÖNİZLEME MODU — Sadece siz görüyorsunuz</span>
        </div>
        <Link href={`/dashboard/vault/${id}`}
          className="bg-[#0c3327]/20 hover:bg-[#0c3327]/30 px-3 py-1 rounded-lg text-xs transition-colors">
          Düzenlemeye Dön →
        </Link>
      </div>

      {/* Hero */}
      <div className="relative px-5 py-16 sm:px-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c3327] via-[#0c3327]/95 to-transparent" />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-[#c7a76f] text-xs tracking-[0.2em] uppercase mb-4">Dijital Anma Profili</p>

          {vault.cover_photo_url ? (
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-[#c7a76f]/40 mx-auto mb-5 relative">
              <Image src={vault.cover_photo_url} alt={vault.display_name} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-[#c7a76f]/10 border-4 border-[#c7a76f]/30 mx-auto mb-5 flex items-center justify-center">
              <span className="text-4xl text-[#c7a76f]/50">👤</span>
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-5xl text-white mb-2">{vault.display_name}</h1>

          {(birthYear || deathYear) && (
            <p className="text-[#c7a76f] text-lg font-serif mb-3">
              {birthYear ?? '?'} — {deathYear ?? '?'}
            </p>
          )}

          {vault.tagline && (
            <p className="text-[#efe7d8] italic font-serif text-base sm:text-lg leading-8 max-w-lg mx-auto">
              {vault.tagline}
            </p>
          )}

          {vault.birth_place && (
            <p className="text-[#c7a76f]/60 text-sm mt-3">📍 {vault.birth_place}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 space-y-10">
        {/* Biography */}
        {vault.biography && (
          <section className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-2xl p-6 sm:p-8">
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-4">Hayat Hikayesi</p>
            <p className="text-[#cfc3ad] leading-8 text-sm sm:text-base whitespace-pre-wrap">{vault.biography}</p>
          </section>
        )}

        {/* Last message */}
        {vault.last_message && (
          <section className="bg-[#0d1f1a] border border-[#c7a76f]/20 rounded-2xl p-6 sm:p-8">
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-4">Bıraktığı Son Mesaj</p>
            <div className="font-serif text-5xl text-[#c7a76f]/20 mb-2">"</div>
            <p className="text-[#efe7d8] font-serif text-lg sm:text-xl leading-9 italic">{vault.last_message}</p>
          </section>
        )}

        {/* Family */}
        {familyMembers && familyMembers.length > 0 && (
          <section>
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-4">Aile Ağacı</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {familyMembers.map((m) => (
                <div key={m.id} className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#c7a76f]/10 mx-auto mb-2 overflow-hidden">
                    {m.photo_url ? (
                      <Image src={m.photo_url} alt={m.full_name} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {m.is_alive ? '😊' : '🕯️'}
                      </div>
                    )}
                  </div>
                  <p className="text-white font-medium text-xs">{m.full_name}</p>
                  <p className="text-[#c7a76f] text-[10px] mt-0.5">{REL_LABELS[m.relationship] ?? m.relationship}</p>
                  {(m.birth_date || m.death_date) && (
                    <p className="text-slate-600 text-[10px] mt-0.5">
                      {m.birth_date ? new Date(m.birth_date).getFullYear() : '?'}
                      {!m.is_alive && m.death_date && ` – ${new Date(m.death_date).getFullYear()}`}
                      {m.is_alive && ' –'}
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
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-4">Anılar</p>
            <div className="space-y-4">
              {memories.map((m) => (
                <div key={m.id} className="bg-[#0d1f1a] border border-[#c7a76f]/10 rounded-xl p-5">
                  {m.title && <h3 className="font-serif text-[#efe7d8] text-lg mb-2">{m.title}</h3>}
                  <p className="text-[#cfc3ad] text-sm leading-7">{m.content}</p>
                  {m.memory_date && <p className="text-[#c7a76f]/50 text-xs mt-2">{new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photos */}
        {photos && photos.length > 0 && (
          <section>
            <p className="text-[#c7a76f] text-xs uppercase tracking-[0.2em] mb-4">Fotoğraf Arşivi ({photos.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="rounded-xl overflow-hidden bg-[#0d1f1a] border border-[#c7a76f]/10">
                  <div className="aspect-square relative">
                    <Image src={p.thumb_url ?? p.original_url} alt={p.original_filename ?? ''} fill className="object-cover" unoptimized />
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
            <p className="text-[#efe7d8] font-medium">{vault.cemetery_name}</p>
            {vault.cemetery_address && <p className="text-[#cfc3ad] text-sm mt-1">{vault.cemetery_address}</p>}
          </section>
        )}

        {/* Secret vault note for life_vault */}
        {isLifeVault && (
          <section className="bg-[#c7a76f]/5 border border-[#c7a76f]/20 rounded-2xl p-5 text-center">
            <p className="text-[#c7a76f] text-sm">🔐 Özel İçerikler</p>
            <p className="text-slate-500 text-xs mt-1">
              {(secretCount as unknown as { count: number })?.count ?? 0} gizli öğe sadece varisleriniz tarafından görülebilecek
            </p>
          </section>
        )}

        {/* Empty state */}
        {!vault.biography && !vault.tagline && (photos?.length ?? 0) === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">Henüz içerik eklenmemiş.</p>
            <Link href={`/dashboard/vault/${id}`}
              className="inline-block mt-4 text-[#c7a76f] text-sm hover:text-[#d4b87c] transition-colors">
              Profili Doldurmaya Başla →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
