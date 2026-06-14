import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { addMemoryAction, updateMemoryAction, deleteMemoryAction } from '@/lib/actions/memories'
import { ImageUploadInput } from '@/components/ImageUploadInput'
import MemorySubmitButton from './_MemorySubmitButton'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string; tab?: string; error?: string; saved?: string }>
}

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

const SECTION_LABELS: Record<string, { label: string; badge: string; badgeCls: string }> = {
  genel:     { label: 'Genel Anı',  badge: 'Anı',       badgeCls: 'bg-[#f5efdf] text-[#788177]' },
  kronoloji: { label: 'Kronoloji',  badge: 'Kronoloji',  badgeCls: 'bg-[#0c3327]/10 text-[#174f35]' },
  featured:  { label: 'Öne Çıkan', badge: 'Öne Çıkan', badgeCls: 'bg-[#dfbd72]/20 text-[#93620f]' },
}

export default async function MemorialAnilarPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId, tab, error, saved } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type')
    .eq('id', id).eq('owner_id', user.id).eq('product_type', 'memorial_profile').single()
  if (!vault) notFound()

  const { data: memories } = await supabase
    .from('vault_memories').select('*')
    .eq('vault_id', id).eq('is_secret', false)
    .order('memory_date', { ascending: false })

  const isLocked = vault.status === 'pending_verification'
  const pageUrl = `/anma-paneli/${id}/anilar`
  const returnUrl = tab === 'kronoloji' ? `${pageUrl}?tab=kronoloji` : pageUrl
  const addAction = addMemoryAction.bind(null, id, returnUrl)

  const isKronoloji = tab === 'kronoloji'

  const anilarItems = memories?.filter(m => {
    const sec = (m as Record<string, unknown>).section as string ?? 'genel'
    return sec === 'genel' || sec === 'featured'
  }) ?? []
  const kronolojItems = memories?.filter(m =>
    (m as Record<string, unknown>).section === 'kronoloji'
  ) ?? []

  const activeItems = isKronoloji ? kronolojItems : anilarItems
  const defaultSection = isKronoloji ? 'kronoloji' : 'genel'

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">
            {vault.display_name}
          </Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Anılar</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra anı ekleyebilirsiniz.
          </div>
        )}
        {saved === '1' && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#c7e4c7] bg-[#e9f5ec] px-5 py-4 text-sm font-medium text-[#174f35]">
            <span>✓</span> {isKronoloji ? 'Kronoloji kaydı eklendi.' : 'Anı başarıyla kaydedildi.'}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
        )}

        {/* Başlık + Sekmeler */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-[#1f2d27] mb-4">Anılar</h1>

          <div className="flex gap-1 rounded-2xl border border-[#e5dccb] bg-[#f9f5ee] p-1 w-fit">
            <Link
              href={pageUrl}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                !isKronoloji
                  ? 'bg-white text-[#174f35] shadow-sm border border-[#e5dccb]'
                  : 'text-[#788177] hover:text-[#1f2d27]'
              }`}
            >
              ✍️ Anılar
              <span className="ml-1.5 rounded-full bg-[#174f35]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#174f35]">
                {anilarItems.length}
              </span>
            </Link>
            <Link
              href={`${pageUrl}?tab=kronoloji`}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                isKronoloji
                  ? 'bg-white text-[#174f35] shadow-sm border border-[#e5dccb]'
                  : 'text-[#788177] hover:text-[#1f2d27]'
              }`}
            >
              📅 Kronoloji
              <span className="ml-1.5 rounded-full bg-[#174f35]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#174f35]">
                {kronolojItems.length}
              </span>
            </Link>
          </div>
        </div>

        {/* Add form */}
        {!isLocked && !editId && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{isKronoloji ? '📅' : '✍️'}</span>
              <h2 className="font-semibold text-[#1f2d27]">
                {isKronoloji ? 'Kronoloji Ekle' : 'Anı Ekle'}
              </h2>
            </div>
            <form action={addAction} className="space-y-4">
              <input type="hidden" name="is_secret" value="false" />
              <input type="hidden" name="section" value={defaultSection} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tarih <span className="text-[#dfbd72]">*</span></label>
                  <input type="date" name="memory_date" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Başlık <span className="font-normal text-[#adb5ab]">(opsiyonel)</span></label>
                  <input type="text" name="title" placeholder={isKronoloji ? 'örn. Doğdu, Evlendi...' : 'Anı başlığı...'} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>{isKronoloji ? 'Açıklama' : 'Anı'} <span className="text-[#dfbd72]">*</span></label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder={isKronoloji
                    ? 'Bu tarihteki olayı kısaca açıklayın...'
                    : 'Bu anıyı yazın... Bir gün, bir an, bir söz.'}
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 space-y-3">
                <p className="text-xs font-semibold text-[#4a5e55] flex items-center gap-1.5">
                  <span>🖼️</span> Fotoğraf <span className="font-normal text-[#adb5ab]">(opsiyonel)</span>
                </p>
                <div>
                  <ImageUploadInput
                    name="media_file"
                    accept="image/*"
                    className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-[#fbf8f0] px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none"
                  />
                  <p className="mt-1 text-[11px] text-[#adb5ab]">veya</p>
                </div>
                <div>
                  <input type="url" name="media_url" placeholder="Fotoğraf / YouTube URL..." className={inputCls} />
                </div>
                <input type="hidden" name="media_type" value="image" />
              </div>

              <MemorySubmitButton />
            </form>
          </div>
        )}

        {/* Liste */}
        {activeItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-16 text-center">
            <p className="text-5xl mb-3">{isKronoloji ? '📅' : '💭'}</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">
              {isKronoloji ? 'Henüz kronoloji yok' : 'Henüz anı yok'}
            </p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">
              {isKronoloji
                ? 'Doğum, evlilik, kariyer gibi önemli yaşam olaylarını ekleyin.'
                : 'Paylaşmak istediğiniz bir hatıra, söz veya özel anı ekleyin.'}
            </p>
          </div>
        ) : isKronoloji ? (
          /* Kronoloji — timeline görünümü */
          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-0.5 rounded-full bg-[#e5dccb]" />
            <div className="space-y-4">
              {activeItems.map((m) => {
                const del = deleteMemoryAction.bind(null, m.id, id)
                const update = updateMemoryAction.bind(null, m.id, id, pageUrl + '?tab=kronoloji')
                const isEditing = editId === m.id

                return (
                  <div key={m.id} className="relative pl-10 group">
                    <div className="absolute left-0 top-3 h-4 w-4 rounded-full border-2 border-[#174f35] bg-white shadow-sm" />

                    {isEditing ? (
                      <div className="rounded-2xl border-2 border-[#174f35]/30 bg-[#fffdf8] p-5 shadow-sm">
                        <p className="text-xs font-semibold text-[#174f35] mb-4 flex items-center gap-1.5">✏️ Düzenle</p>
                        <form action={update} className="space-y-3">
                          <input type="hidden" name="section" value="kronoloji" />
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>Tarih *</label>
                              <input type="date" name="memory_date" required defaultValue={m.memory_date ?? ''} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Başlık</label>
                              <input type="text" name="title" defaultValue={m.title ?? ''} className={inputCls} />
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Açıklama *</label>
                            <textarea name="content" required rows={3} defaultValue={m.content ?? ''} className={inputCls + ' resize-none'} />
                          </div>
                          <div className="flex items-center gap-3">
                            <MemorySubmitButton label="Kaydet" pendingLabel="Kaydediliyor..." />
                            <Link href={`${pageUrl}?tab=kronoloji`} className="rounded-xl border border-[#e5dccb] px-5 py-2.5 text-sm font-medium text-[#788177] hover:bg-[#f5efdf] transition-colors">İptal</Link>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 hover:border-[#174f35]/20 transition-colors">
                        <div className="flex items-start gap-4">
                          {m.media_type === 'image' && m.media_url && (
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e5dccb]">
                              <Image src={m.media_url} alt={m.title ?? ''} fill className="object-cover" unoptimized />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {m.memory_date && (
                              <p className="text-xs font-bold text-[#dfbd72] tracking-wide mb-0.5">
                                {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            )}
                            {m.title && <h3 className="font-semibold text-[#1f2d27] font-serif">{m.title}</h3>}
                            <p className="text-sm text-[#4a5e55] leading-6 mt-0.5 whitespace-pre-wrap">{m.content}</p>
                          </div>
                          {!isLocked && (
                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`?tab=kronoloji&edit=${m.id}`} className="text-xs font-medium text-[#174f35] hover:underline">Düzenle</Link>
                              <span className="text-[#e5dccb]">·</span>
                              <form action={del}>
                                <button type="submit" className="text-xs font-medium text-[#e5dccb] hover:text-red-400 transition-colors">Sil</button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Anılar — kart görünümü: sol foto + sağ metin */
          <div className="space-y-3">
            {activeItems.map((m) => {
              const del = deleteMemoryAction.bind(null, m.id, id)
              const update = updateMemoryAction.bind(null, m.id, id, pageUrl)
              const embedUrl = m.media_type === 'video' && m.media_url ? getVideoEmbed(m.media_url) : null
              const isEditing = editId === m.id
              const sec = (m as Record<string, unknown>).section as string ?? 'genel'
              const sectionInfo = SECTION_LABELS[sec] ?? SECTION_LABELS.genel

              return (
                <div key={m.id} className="group rounded-2xl border border-[#e5dccb] bg-white overflow-hidden hover:border-[#174f35]/20 transition-colors">
                  {isEditing ? (
                    <div className="p-5">
                      <p className="text-xs font-semibold text-[#174f35] mb-4 flex items-center gap-1.5">✏️ Anıyı Düzenle</p>
                      <form action={update} className="space-y-3">
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className={labelCls}>Tarih *</label>
                            <input type="date" name="memory_date" required defaultValue={m.memory_date ?? ''} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Başlık</label>
                            <input type="text" name="title" defaultValue={m.title ?? ''} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Bölüm</label>
                            <select name="section" defaultValue={sec} className={inputCls}>
                              <option value="genel">Genel Anı</option>
                              <option value="featured">Öne Çıkan</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Anı *</label>
                          <textarea name="content" required rows={4} defaultValue={m.content ?? ''} className={inputCls + ' resize-none'} />
                        </div>
                        <div className="flex items-center gap-3">
                          <MemorySubmitButton label="Kaydet" pendingLabel="Kaydediliyor..." />
                          <Link href={pageUrl} className="rounded-xl border border-[#e5dccb] px-5 py-2.5 text-sm font-medium text-[#788177] hover:bg-[#f5efdf] transition-colors">İptal</Link>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex gap-4 p-4">
                      {/* Sol: küçük foto */}
                      {m.media_type === 'image' && m.media_url ? (
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#e5dccb]">
                          <Image src={m.media_url} alt={m.title ?? 'Anı fotoğrafı'} fill className="object-cover" unoptimized />
                        </div>
                      ) : embedUrl ? (
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#e5dccb] bg-[#1f2d27] flex items-center justify-center">
                          <span className="text-2xl">🎬</span>
                        </div>
                      ) : null}

                      {/* Sağ: içerik */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {m.memory_date && (
                              <span className="text-xs font-semibold text-[#dfbd72] tracking-wide">
                                {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sectionInfo.badgeCls}`}>
                              {sectionInfo.badge}
                            </span>
                          </div>
                          {!isLocked && (
                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`?edit=${m.id}`} className="text-xs font-medium text-[#174f35] hover:underline">Düzenle</Link>
                              <span className="text-[#e5dccb]">·</span>
                              <form action={del}>
                                <button type="submit" className="text-xs font-medium text-[#e5dccb] hover:text-red-400 transition-colors">Sil</button>
                              </form>
                            </div>
                          )}
                        </div>
                        {m.title && <h3 className="font-semibold text-[#1f2d27] font-serif mb-0.5">{m.title}</h3>}
                        <p className="text-sm text-[#4a5e55] leading-6 line-clamp-3 whitespace-pre-wrap">{m.content}</p>

                        {embedUrl && (
                          <a href={m.media_url!} target="_blank" rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#174f35] hover:underline">
                            🎬 Videoyu İzle →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
