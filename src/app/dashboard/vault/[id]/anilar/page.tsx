import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { addMemoryAction, deleteMemoryAction } from '@/lib/actions/memories'

interface Props { params: Promise<{ id: string }> }

function getVideoEmbed(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

export default async function AnilarPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name, status, product_type').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: memories } = await supabase
    .from('vault_memories')
    .select('*')
    .eq('vault_id', id)
    .eq('is_secret', false)
    .order('memory_date', { ascending: false })

  const isLocked = vault.status === 'pending_verification'
  const addAction = addMemoryAction.bind(null, id)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Anılar</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra anı ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Anılar</h1>
            <p className="text-xs text-[#788177] mt-0.5">{memories?.length ?? 0} anı</p>
          </div>
        </div>

        {!isLocked && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_16px_50px_rgba(64,48,24,0.06)] mb-7">
            <h2 className="text-sm font-semibold text-[#1f2d27] mb-4">Yeni Anı Ekle</h2>
            <form action={addAction} className="space-y-4" encType="multipart/form-data">
              <input type="hidden" name="is_secret" value="false" />

              {/* Tarih — zorunlu */}
              <div>
                <label className={labelCls}>
                  Anı Tarihi <span className="text-[#dfbd72]">*</span>
                </label>
                <input
                  type="date"
                  name="memory_date"
                  required
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-[#adb5ab]">Tarih seçilmeden anı kaydedilmez</p>
              </div>

              {/* Başlık */}
              <div>
                <label className={labelCls}>Başlık (opsiyonel)</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Anı başlığı..."
                  className={inputCls}
                />
              </div>

              {/* İçerik */}
              <div>
                <label className={labelCls}>
                  Anı <span className="text-[#dfbd72]">*</span>
                </label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="Bu anıyı yazın... Bir gün, bir an, bir söz."
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* Medya */}
              <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 space-y-3">
                <p className="text-xs font-semibold text-[#4a5e55]">Fotoğraf veya Video (opsiyonel)</p>

                <div>
                  <label className={labelCls}>Dosya Yükle</label>
                  <input
                    type="file"
                    name="media_file"
                    accept="image/*,video/*"
                    className="w-full rounded-xl border border-[#e5dccb] bg-[#fbf8f0] px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-[#adb5ab]">Fotoğraf veya video dosyası — otomatik yüklenir</p>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className={labelCls}>veya URL girin</label>
                    <input
                      type="url"
                      name="media_url"
                      placeholder="https://... (fotoğraf veya YouTube linki)"
                      className={inputCls}
                    />
                  </div>
                  <div className="shrink-0">
                    <label className={labelCls}>Tür</label>
                    <select
                      name="media_type"
                      className="rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]"
                    >
                      <option value="image">Fotoğraf</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors"
              >
                Anıyı Kaydet
              </button>
            </form>
          </div>
        )}

        <div className="space-y-5">
          {!memories?.length ? (
            <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] p-14 text-center">
              <div className="text-4xl mb-3">💭</div>
              <p className="text-[#788177] text-sm">Henüz anı eklenmemiş</p>
              <p className="text-xs text-[#adb5ab] mt-1">Paylaşmak istediğiniz bir anı, hatıra veya güzel bir söz ekleyin</p>
            </div>
          ) : memories.map((m) => {
            const del = deleteMemoryAction.bind(null, m.id, id)
            const embedUrl = m.media_type === 'video' && m.media_url ? getVideoEmbed(m.media_url) : null

            return (
              <div key={m.id} className="rounded-2xl border border-[#e5dccb] bg-white group hover:border-[#174f35]/20 transition-colors overflow-hidden">
                {/* Fotoğraf */}
                {m.media_type === 'image' && m.media_url && (
                  <div className="relative w-full aspect-video bg-[#f5efdf]">
                    <Image
                      src={m.media_url}
                      alt={m.title ?? 'Anı fotoğrafı'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Video embed */}
                {m.media_type === 'video' && embedUrl && (
                  <div className="aspect-video bg-[#f5efdf]">
                    <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={m.title ?? 'Video'} />
                  </div>
                )}

                {/* Video direkt link (embed yoksa) */}
                {m.media_type === 'video' && m.media_url && !embedUrl && (
                  <div className="bg-[#f5efdf] px-5 py-3 flex items-center gap-2">
                    <span className="text-xl">🎬</span>
                    <a
                      href={m.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#174f35] hover:underline font-medium"
                    >
                      Videoyu Aç →
                    </a>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {m.memory_date && (
                        <p className="text-xs text-[#dfbd72] font-medium mb-1.5">
                          {new Date(m.memory_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {m.title && <h3 className="font-semibold text-[#1f2d27] mb-1.5">{m.title}</h3>}
                      <p className="text-[#4a5e55] text-sm leading-7 whitespace-pre-wrap">{m.content}</p>
                    </div>
                    {!isLocked && (
                      <form action={del}>
                        <button
                          type="submit"
                          className="text-[#e5dccb] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs font-medium shrink-0"
                        >
                          Sil
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
