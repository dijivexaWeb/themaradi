import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { addMemoryAction, updateMemoryAction, deleteMemoryAction } from '@/lib/actions/memories'
import { ImageUploadInput } from '@/components/ImageUploadInput'
import PersonHeader from '../_PersonHeader'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string; error?: string }>
}

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export default async function AnilarPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId, error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: memories } = await supabase
    .from('vault_memories').select('*')
    .eq('vault_id', id).eq('is_secret', false)
    .order('memory_date', { ascending: false })

  const isLocked = vault.status === 'pending_verification'
  const pageUrl = `/dashboard/vault/${id}/anilar`
  const addAction = addMemoryAction.bind(null, id, pageUrl)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Anılar</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Anılar" sectionIcon="💭" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra anı ekleyebilirsiniz.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Anılar</h1>
            <p className="text-xs text-[#788177] mt-0.5">{memories?.length ?? 0} anı</p>
          </div>
        </div>

        {/* Add form */}
        {!isLocked && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✍️</span>
              <h2 className="font-semibold text-[#1f2d27]">Yeni Anı Ekle</h2>
            </div>
            <form action={addAction} className="space-y-4">
              <input type="hidden" name="is_secret" value="false" />

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Anı Tarihi <span className="text-[#dfbd72]">*</span></label>
                  <input type="date" name="memory_date" required className={inputCls} />
                  <p className="mt-1 text-xs text-[#adb5ab]">Tarih seçilmeden anı kaydedilmez</p>
                </div>
                <div>
                  <label className={labelCls}>Başlık (opsiyonel)</label>
                  <input type="text" name="title" placeholder="Anı başlığı..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bölüm</label>
                  <select name="section" className={inputCls}>
                    <option value="genel">Genel Anı</option>
                    <option value="kronoloji">Kronoloji (Zaman Tüneli)</option>
                    <option value="featured">Öne Çıkan</option>
                  </select>
                  <p className="mt-1 text-xs text-[#adb5ab]">Kronoloji ve öne çıkan anılar ayrı bölümlerde görünür</p>
                </div>
              </div>

              <div>
                <label className={labelCls}>Anı <span className="text-[#dfbd72]">*</span></label>
                <textarea name="content" required rows={4}
                  placeholder="Bu anıyı yazın... Bir gün, bir an, bir söz."
                  className={inputCls + ' resize-none'} />
              </div>

              <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 space-y-3">
                <p className="text-xs font-semibold text-[#4a5e55] flex items-center gap-1.5">
                  <span>🖼️</span> Fotoğraf veya Video <span className="font-normal text-[#adb5ab]">(opsiyonel)</span>
                </p>
                <div>
                  <label className={labelCls}>Dosya Yükle</label>
                  <ImageUploadInput
                    name="media_file"
                    accept="image/*,video/*"
                    className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-[#fbf8f0] px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className={labelCls}>veya URL</label>
                    <input type="url" name="media_url" placeholder="https://... (fotoğraf veya YouTube)" className={inputCls} />
                  </div>
                  <div className="shrink-0">
                    <label className={labelCls}>Tür</label>
                    <select name="media_type"
                      className="rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                      <option value="image">Fotoğraf</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Anıyı Kaydet
              </button>
            </form>
          </div>
        )}

        {/* Timeline */}
        {!memories?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="text-6xl mb-4">💭</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">Henüz anı yok</p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">Paylaşmak istediğiniz bir hatıra, söz veya özel anı ekleyin.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-0.5 rounded-full bg-[#e5dccb]" />

            <div className="space-y-0">
              {memories.map((m) => {
                const del = deleteMemoryAction.bind(null, m.id, id)
                const update = updateMemoryAction.bind(null, m.id, id, pageUrl)
                const embedUrl = m.media_type === 'video' && m.media_url ? getVideoEmbed(m.media_url) : null
                const isEditing = editId === m.id

                return (
                  <div key={m.id} className="relative pl-10 pb-8 last:pb-0 group">
                    <div className="absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-[#174f35] bg-white shadow-sm" />

                    {isEditing ? (
                      /* ── Inline edit form ── */
                      <div className="rounded-2xl border-2 border-[#174f35]/30 bg-[#fffdf8] p-5 shadow-sm">
                        <p className="text-xs font-semibold text-[#174f35] mb-4 flex items-center gap-1.5">
                          <span>✏️</span> Anıyı Düzenle
                        </p>
                        <form action={update} className="space-y-3">
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <label className={labelCls}>Tarih <span className="text-[#dfbd72]">*</span></label>
                              <input type="date" name="memory_date" required
                                defaultValue={m.memory_date ?? ''}
                                className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Başlık</label>
                              <input type="text" name="title"
                                defaultValue={m.title ?? ''}
                                placeholder="Başlık..." className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Bölüm</label>
                              <select name="section" defaultValue={(m as Record<string, unknown>).section as string ?? 'genel'} className={inputCls}>
                                <option value="genel">Genel Anı</option>
                                <option value="kronoloji">Kronoloji</option>
                                <option value="featured">Öne Çıkan</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Anı <span className="text-[#dfbd72]">*</span></label>
                            <textarea name="content" required rows={4}
                              defaultValue={m.content ?? ''}
                              className={inputCls + ' resize-none'} />
                          </div>
                          <div className="flex items-center gap-3 pt-1">
                            <button type="submit"
                              className="rounded-xl bg-[#174f35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123f2b] transition-colors">
                              Kaydet
                            </button>
                            <Link href={pageUrl}
                              className="rounded-xl border border-[#e5dccb] px-5 py-2.5 text-sm font-medium text-[#788177] hover:bg-[#f5efdf] transition-colors">
                              İptal
                            </Link>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* ── Read view ── */
                      <div className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden hover:border-[#174f35]/20 transition-colors">
                        {m.media_type === 'image' && m.media_url && (
                          <div className="relative w-full">
                            <Image
                              src={m.media_url}
                              alt={m.title ?? 'Anı fotoğrafı'}
                              width={0} height={0}
                              sizes="(max-width: 768px) 100vw, 672px"
                              style={{ width: '100%', height: 'auto' }}
                              className="rounded-t-2xl"
                              unoptimized
                            />
                          </div>
                        )}
                        {m.media_type === 'video' && embedUrl && (
                          <div className="aspect-video">
                            <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={m.title ?? 'Video'} />
                          </div>
                        )}
                        {m.media_type === 'video' && m.media_url && !embedUrl && (
                          <div className="bg-[#f5efdf] px-5 py-3 flex items-center gap-2">
                            <span>🎬</span>
                            <a href={m.media_url} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-[#174f35] hover:underline font-medium">Videoyu Aç →</a>
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              {m.memory_date && (
                                <p className="text-xs font-semibold text-[#dfbd72] tracking-wide">
                                  {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              )}
                              {(m as Record<string, unknown>).section === 'kronoloji' && (
                                <span className="rounded-full bg-[#0c3327]/10 px-2 py-0.5 text-[10px] font-semibold text-[#174f35]">Kronoloji</span>
                              )}
                              {(m as Record<string, unknown>).section === 'featured' && (
                                <span className="rounded-full bg-[#dfbd72]/20 px-2 py-0.5 text-[10px] font-semibold text-[#93620f]">Öne Çıkan</span>
                              )}
                            </div>
                              {m.title && <h3 className="font-semibold text-[#1f2d27] mb-1.5 font-serif text-lg">{m.title}</h3>}
                              <p className="text-[#4a5e55] text-sm leading-7 whitespace-pre-wrap">{m.content}</p>
                            </div>
                            {!isLocked && (
                              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`?edit=${m.id}`}
                                  className="text-xs font-medium text-[#174f35] hover:underline">
                                  Düzenle
                                </Link>
                                <span className="text-[#e5dccb]">·</span>
                                <form action={del}>
                                  <button type="submit" className="text-xs font-medium text-[#e5dccb] hover:text-red-400 transition-colors">
                                    Sil
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
