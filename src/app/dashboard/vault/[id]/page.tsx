import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Eye, Users, BookOpen, MessageCircle, ImageIcon, Video, UserRound, Mic } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ purchased?: string }>
}

const REL_ICONS: Record<string, string> = {
  mother: '👩', father: '👨', spouse: '💑', son: '👦',
  daughter: '👧', sibling: '🧑', grandparent: '👴', grandchild: '🧒', other: '👤',
}

export default async function MemoryAreaPage({ params, searchParams }: Props) {
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
      .eq('vault_id', id).order('sort_order', { ascending: true }).limit(6),
    supabase.from('vault_memories')
      .select('id, title, content, memory_date', { count: 'exact' })
      .eq('vault_id', id).eq('is_secret', false)
      .order('memory_date', { ascending: false }).limit(3),
    supabase.from('media')
      .select('id, thumb_url, original_url', { count: 'exact' })
      .eq('vault_id', id).eq('media_type', 'image')
      .order('sort_order', { ascending: true }).limit(8),
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

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending_verification: { label: 'Doğrulama Bekliyor', cls: 'bg-[#fff4dc] text-[#93620f] border-[#ead4a5]' },
    hidden_vault:        { label: 'Gizli Alan',          cls: 'bg-[#eef1ea] text-[#496056] border-[#dfe6d8]' },
    private_memorial:    { label: 'Özel Anma',           cls: 'bg-[#eef1ea] text-[#174f35] border-[#dfe6d8]' },
    public_memorial:     { label: 'Yayında',             cls: 'bg-[#e9f5ec] text-[#176b3f] border-[#cfe7d3]' },
    suspended:           { label: 'Askıda',              cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const status = statusConfig[area.status ?? 'hidden_vault'] ?? statusConfig.hidden_vault

  const blockCls = 'rounded-3xl border border-[#e5dccb] bg-[#fffdf8] overflow-hidden shadow-[0_4px_24px_rgba(64,48,24,0.05)]'
  const emptyBlockCls = 'rounded-3xl border-2 border-dashed border-[#e5dccb] bg-white overflow-hidden'
  const sectionHeaderCls = 'flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0ebe0]'
  const addBtnCls = 'inline-flex items-center gap-1.5 rounded-xl bg-[#174f35] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(23,79,53,0.2)] hover:bg-[#123f2b] transition-colors'
  const editBtnCls = 'text-xs font-medium text-[#174f35] hover:underline transition-colors'

  return (
    <div className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#788177]">
            <Link href="/dashboard" className="hover:text-[#174f35] transition-colors">Anı Alanım</Link>
            <span>/</span>
            <span className="font-semibold text-[#22362e]">{area.display_name}</span>
          </div>
          <Link href={`/preview/${id}`} target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#788177] hover:text-[#174f35] transition-colors">
            <Eye className="h-3.5 w-3.5" />
            Önizle
          </Link>
        </div>

        {purchased && (
          <div className="mb-4 rounded-2xl border border-[#dfbd72]/40 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Alanınız oluşturuldu. Ödeme doğrulandıktan sonra içerikleri kaydedebilirsiniz.
          </div>
        )}
        {isLocked && (
          <div className="mb-4 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulaması bekleniyor. Bu sırada sayfaları gezebilirsiniz.
          </div>
        )}

        <div className="space-y-4">

          {/* ══ BLOK 1: PROFİL ══ */}
          {area.cover_photo_url || area.birth_date || area.tagline ? (
            <div className={blockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#b08340]" />
                  <span className="text-sm font-semibold text-[#1f2d27]">Profil</span>
                </div>
                <Link href={`/dashboard/vault/${id}/profil`} className={editBtnCls}>Düzenle →</Link>
              </div>
              <div className="p-6 flex items-center gap-6">
                <div className="relative h-24 w-24 shrink-0 rounded-full border-2 border-[#dfbd72] bg-[#f8efd8] overflow-hidden shadow-lg">
                  {area.cover_photo_url ? (
                    <Image src={area.cover_photo_url} alt={area.display_name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-serif text-3xl text-[#b08340]">
                      {area.display_name[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-serif text-2xl text-[#1f2d27] mb-1">{area.display_name}</h1>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}>{status.label}</span>
                    <span className="rounded-full border border-[#eadfca] bg-[#fbf5e8] px-2 py-0.5 text-[11px] font-semibold text-[#9a6b22]">
                      {isMemorial ? 'Anı Profili' : 'Yaşam Anısı'}
                    </span>
                  </div>
                  {(birthYear || deathYear) && (
                    <p className="font-serif text-sm text-[#788177]">{birthYear ?? '?'} – {deathYear ?? '...'}</p>
                  )}
                  {area.tagline && (
                    <p className="font-serif text-sm italic text-[#7a7467] mt-1">"{area.tagline}"</p>
                  )}
                  {area.slug && (
                    <Link href={`/memorial/${area.slug}`} target="_blank"
                      className="mt-1 inline-block text-xs text-[#174f35] font-medium hover:underline">
                      theeternalmemory.com/ani-alanim/{area.slug} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={emptyBlockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#c8bfb0]" />
                  <span className="text-sm font-semibold text-[#adb5ab]">Profil</span>
                </div>
                <Link href={`/dashboard/vault/${id}/profil`} className={addBtnCls}>+ Profil Ekle</Link>
              </div>
              <div className="p-6 flex items-center gap-6">
                <div className="h-24 w-24 shrink-0 rounded-full bg-[#f0ebe0] flex items-center justify-center">
                  <UserRound className="h-10 w-10 text-[#c8bfb0]" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-48 rounded-xl bg-[#f0ebe0]" />
                  <div className="h-4 w-28 rounded-lg bg-[#f0ebe0]" />
                  <div className="h-4 w-64 rounded-lg bg-[#f0ebe0]" />
                </div>
              </div>
            </div>
          )}

          {/* ══ BLOK 2: BİYOGRAFİ ══ */}
          {(area.biography?.length ?? 0) > 0 ? (
            <div className={blockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#b08340]" />
                  <span className="text-sm font-semibold text-[#1f2d27]">Hayat Hikayesi</span>
                </div>
                <Link href={`/dashboard/vault/${id}/biography`} className={editBtnCls}>Düzenle →</Link>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#4a5e55] leading-7 line-clamp-4">{area.biography}</p>
                {area.biography!.length > 300 && (
                  <p className="mt-2 text-xs text-[#adb5ab]">{area.biography!.length} karakter — tam metin anma sayfasında görünür</p>
                )}
              </div>
            </div>
          ) : (
            <div className={emptyBlockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#c8bfb0]" />
                  <span className="text-sm font-semibold text-[#adb5ab]">Hayat Hikayesi</span>
                </div>
                <Link href={`/dashboard/vault/${id}/biography`} className={addBtnCls}>+ Hikaye Yaz</Link>
              </div>
              <div className="p-6 space-y-2.5">
                <div className="h-3.5 w-full rounded-full bg-[#f0ebe0]" />
                <div className="h-3.5 w-full rounded-full bg-[#f0ebe0]" />
                <div className="h-3.5 w-3/4 rounded-full bg-[#f0ebe0]" />
                <div className="h-3.5 w-full rounded-full bg-[#f0ebe0]" />
                <div className="h-3.5 w-5/6 rounded-full bg-[#f0ebe0]" />
                <p className="pt-1 text-xs text-[#adb5ab]">Hayat hikayesini yazdığınızda anma sayfasında görünecek.</p>
              </div>
            </div>
          )}

          {/* ══ BLOK 3: AİLE BAĞLARI ══ */}
          {(familyCount ?? 0) > 0 ? (
            <div className={blockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#b08340]" />
                  <span className="text-sm font-semibold text-[#1f2d27]">Aile Bağları</span>
                  <span className="text-xs text-[#adb5ab]">{familyCount} kişi</span>
                </div>
                <Link href={`/dashboard/vault/${id}/aile`} className={editBtnCls}>Düzenle →</Link>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  {familyMembers?.map((m) => (
                    <div key={m.id} className="flex flex-col items-center gap-1.5 w-16">
                      <div className="relative h-14 w-14 rounded-full border-2 border-[#e5dccb] bg-[#f5efdf] overflow-hidden">
                        {m.photo_url ? (
                          <Image src={m.photo_url} alt={m.full_name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-2xl">
                            {REL_ICONS[m.relationship] ?? '👤'}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[#4a5e55] font-medium text-center leading-tight line-clamp-2">{m.full_name.split(' ')[0]}</p>
                    </div>
                  ))}
                  {(familyCount ?? 0) > 6 && (
                    <div className="flex flex-col items-center gap-1.5 w-16">
                      <div className="h-14 w-14 rounded-full border-2 border-dashed border-[#e5dccb] bg-[#f5efdf] flex items-center justify-center text-sm font-bold text-[#788177]">
                        +{(familyCount ?? 0) - 6}
                      </div>
                      <p className="text-[11px] text-[#adb5ab] text-center">daha</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={emptyBlockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#c8bfb0]" />
                  <span className="text-sm font-semibold text-[#adb5ab]">Aile Bağları</span>
                </div>
                <Link href={`/dashboard/vault/${id}/aile`} className={addBtnCls}>+ Aile Ekle</Link>
              </div>
              <div className="p-6 flex gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-1.5 w-16">
                    <div className="h-14 w-14 rounded-full bg-[#f0ebe0]" />
                    <div className="h-3 w-12 rounded-full bg-[#f0ebe0]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ BLOK 4: ANILAR ══ */}
          {(memoriesCount ?? 0) > 0 ? (
            <div className={blockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#b08340]" />
                  <span className="text-sm font-semibold text-[#1f2d27]">Anılar</span>
                  <span className="text-xs text-[#adb5ab]">{memoriesCount} anı</span>
                </div>
                <Link href={`/dashboard/vault/${id}/anilar`} className={editBtnCls}>Düzenle →</Link>
              </div>
              <div className="relative p-6">
                <div className="absolute left-9 top-8 bottom-8 w-0.5 rounded-full bg-[#e5dccb]" />
                <div className="space-y-5">
                  {recentMemories?.map((m) => (
                    <div key={m.id} className="relative pl-10">
                      <div className="absolute left-[5px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#174f35] bg-white shadow-sm" />
                      {m.memory_date && (
                        <p className="text-[11px] font-semibold text-[#dfbd72] tracking-wide mb-0.5">
                          {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {m.title && <p className="font-serif text-sm font-semibold text-[#1f2d27]">{m.title}</p>}
                      <p className="text-xs text-[#4a5e55] leading-5 line-clamp-2">{m.content}</p>
                    </div>
                  ))}
                </div>
                {(memoriesCount ?? 0) > 3 && (
                  <Link href={`/dashboard/vault/${id}/anilar`}
                    className="mt-4 block text-center text-xs text-[#174f35] font-medium hover:underline">
                    Tüm {memoriesCount} anıyı gör →
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className={emptyBlockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#c8bfb0]" />
                  <span className="text-sm font-semibold text-[#adb5ab]">Anılar</span>
                </div>
                <Link href={`/dashboard/vault/${id}/anilar`} className={addBtnCls}>+ Anı Ekle</Link>
              </div>
              <div className="relative p-6">
                <div className="absolute left-9 top-8 bottom-8 w-0.5 rounded-full bg-[#f0ebe0]" />
                <div className="space-y-5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-[5px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#e5dccb] bg-[#f0ebe0]" />
                      <div className="h-2.5 w-24 rounded-full bg-[#f0ebe0] mb-1.5" />
                      <div className="h-3 w-full rounded-full bg-[#f0ebe0] mb-1" />
                      <div className="h-3 w-3/4 rounded-full bg-[#f0ebe0]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ BLOK 5: FOTOĞRAFLAR ══ */}
          {(photoCount ?? 0) > 0 ? (
            <div className={blockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#b08340]" />
                  <span className="text-sm font-semibold text-[#1f2d27]">Fotoğraflar</span>
                  <span className="text-xs text-[#adb5ab]">{photoCount} fotoğraf</span>
                </div>
                <Link href={`/dashboard/vault/${id}/fotolar`} className={editBtnCls}>Düzenle →</Link>
              </div>
              <div className="p-4">
                <div className="columns-3 sm:columns-4 gap-2">
                  {recentPhotos?.map((p) => (
                    <div key={p.id} className="break-inside-avoid mb-2 overflow-hidden rounded-xl">
                      <Image
                        src={p.thumb_url ?? p.original_url}
                        alt="Fotoğraf"
                        width={0} height={0}
                        sizes="(max-width: 640px) 33vw, 25vw"
                        style={{ width: '100%', height: 'auto' }}
                        className="rounded-xl"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
                {(photoCount ?? 0) > 8 && (
                  <Link href={`/dashboard/vault/${id}/fotolar`}
                    className="mt-3 block text-center text-xs text-[#174f35] font-medium hover:underline">
                    Tüm {photoCount} fotoğrafı gör →
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className={emptyBlockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#c8bfb0]" />
                  <span className="text-sm font-semibold text-[#adb5ab]">Fotoğraflar</span>
                </div>
                <Link href={`/dashboard/vault/${id}/fotolar`} className={addBtnCls}>+ Fotoğraf Ekle</Link>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className={`rounded-xl bg-[#f0ebe0] ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ BLOK 6: VİDEOLAR ══ */}
          {(videoCount ?? 0) > 0 ? (
            <div className={blockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#b08340]" />
                  <span className="text-sm font-semibold text-[#1f2d27]">Videolar</span>
                  <span className="text-xs text-[#adb5ab]">{videoCount} video</span>
                </div>
                <Link href={`/dashboard/vault/${id}/videolar`} className={editBtnCls}>Düzenle →</Link>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {recentVideos?.map((v) => (
                  <div key={v.id} className="aspect-video rounded-xl bg-[#1f2d27]/10 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-white/80 flex items-center justify-center shadow">
                        <span className="text-[#174f35] text-lg ml-0.5">▶</span>
                      </div>
                    </div>
                    {v.taken_at && (
                      <p className="absolute bottom-1.5 left-2 text-[10px] text-white/70">
                        {new Date(v.taken_at).getFullYear()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={emptyBlockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#c8bfb0]" />
                  <span className="text-sm font-semibold text-[#adb5ab]">Videolar</span>
                </div>
                <Link href={`/dashboard/vault/${id}/videolar`} className={addBtnCls}>+ Video Ekle</Link>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-video rounded-xl bg-[#f0ebe0] flex items-center justify-center">
                    <Video className="h-6 w-6 text-[#c8bfb0]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ BLOK 7: SES KAYITLARI ══ */}
          {(audioCount ?? 0) > 0 ? (
            <div className={blockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#b08340]" />
                  <span className="text-sm font-semibold text-[#1f2d27]">Ses Kayıtları</span>
                  <span className="text-xs text-[#adb5ab]">{audioCount} kayıt</span>
                </div>
                <Link href={`/dashboard/vault/${id}/ses-kayitlari`} className={editBtnCls}>Düzenle →</Link>
              </div>
              <div className="p-5 space-y-2">
                {recentAudio?.map((rec) => (
                  <div key={rec.id} className="flex items-center gap-3 rounded-xl border border-[#f0ebe0] bg-white px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#174f35]/10 text-[#174f35]">
                      <Mic className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1f2d27]">{rec.title}</p>
                      {rec.author && <p className="truncate text-xs text-[#788177]">{rec.author}</p>}
                    </div>
                  </div>
                ))}
                {(audioCount ?? 0) > 3 && (
                  <Link href={`/dashboard/vault/${id}/ses-kayitlari`}
                    className="block text-center text-xs text-[#174f35] font-medium hover:underline pt-1">
                    Tüm {audioCount} kaydı gör →
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className={emptyBlockCls}>
              <div className={sectionHeaderCls}>
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#c8bfb0]" />
                  <span className="text-sm font-semibold text-[#adb5ab]">Ses Kayıtları</span>
                </div>
                <Link href={`/dashboard/vault/${id}/ses-kayitlari`} className={addBtnCls}>+ Ses Ekle</Link>
              </div>
              <div className="p-5 space-y-2">
                {[0, 1].map(i => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-[#f0ebe0] bg-white px-4 py-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[#f0ebe0]" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded-full bg-[#f0ebe0]" />
                      <div className="h-2.5 w-20 rounded-full bg-[#f0ebe0]" />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-center text-xs text-[#adb5ab]">Ses kayıtları anma sayfasında özel bir bölümde çalar.</p>
              </div>
            </div>
          )}

          {/* Taziye Defteri */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ebe0]">
              <div className="flex items-center gap-2">
                <span className="text-base">🕊️</span>
                <span className="text-sm font-semibold text-[#1f2d27]">Taziye Defteri</span>
                {(pendingGuestbookCount ?? 0) > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c7a76f] text-[10px] font-bold text-white">
                    {pendingGuestbookCount}
                  </span>
                )}
              </div>
              <Link href={`/dashboard/vault/${id}/taziye-defteri`} className="text-xs font-medium text-[#174f35] hover:underline">
                {(pendingGuestbookCount ?? 0) > 0 ? `${pendingGuestbookCount} mesaj bekliyor →` : 'Yönet →'}
              </Link>
            </div>
            <div className="px-5 py-3">
              <p className="text-xs text-[#788177]">
                {(pendingGuestbookCount ?? 0) > 0
                  ? 'Onay bekleyen taziye mesajları var. İncelemek için tıklayın.'
                  : 'Ziyaretçilerin bıraktığı taziye mesajlarını buradan onaylayın.'}
              </p>
            </div>
          </div>

          {/* Alt durum */}
          <div className="rounded-2xl border border-[#e5dccb] bg-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full ${qrActive || area.slug ? 'bg-[#174f35]' : 'bg-red-400'}`} />
              <span className="text-sm text-[#4a5e55]">
                {qrActive ? 'QR aktif' : area.slug ? `theeternalmemory.com/ani-alanim/${area.slug}` : 'Sayfa adresi belirlenmedi'}
              </span>
            </div>
            <Link href={`/dashboard/vault/${id}/settings`}
              className="text-xs font-medium text-[#174f35] hover:underline">
              {area.slug || qrActive ? 'Ayarları Düzenle →' : 'Adres Belirle →'}
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
