import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addVideoAction, deleteMediaAction } from '@/lib/actions/media'

interface Props { params: Promise<{ id: string }> }

const VIDEO_LIMIT_MEMORIAL = 10

export default async function VideolarPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name, status, product_type').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: videos } = await supabase
    .from('media')
    .select('*')
    .eq('vault_id', id)
    .eq('media_type', 'video')
    .order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const isMemorial = vault.product_type === 'memorial_profile'
  const atLimit = isMemorial && (videos?.length ?? 0) >= VIDEO_LIMIT_MEMORIAL
  const addVideo = addVideoAction.bind(null, id)

  function getVideoEmbed(url: string): string | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    return null
  }

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Videolar</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra video ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Videolar</h1>
            <p className="text-xs text-[#788177] mt-0.5">
              {videos?.length ?? 0} / {isMemorial ? VIDEO_LIMIT_MEMORIAL : '∞'} video
            </p>
          </div>
        </div>

        {!isLocked && !atLimit && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_16px_50px_rgba(64,48,24,0.06)] mb-8">
            <h2 className="text-sm font-semibold text-[#1f2d27] mb-1">Video Ekle</h2>
            <p className="text-xs text-[#788177] mb-4">YouTube / Vimeo linki, direkt video URL'si veya dosya yükleme</p>
            <form action={addVideo} className="space-y-4" encType="multipart/form-data">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Video URL</label>
                  <input type="url" name="url" placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Dosya Yükle</label>
                  <input
                    type="file"
                    name="file"
                    accept="video/*"
                    className="w-full rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Video başlığı</label>
                  <input type="text" name="title" placeholder="Doğum günü videosu" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Çekildiği tarih ve saat <span className="text-[#dfbd72]">*</span></label>
                  <input type="datetime-local" name="taken_at" required className={inputCls} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className={labelCls}>Görünürlük <span className="text-[#dfbd72]">*</span></label>
                  <select
                    name="visibility"
                    required
                    defaultValue="private"
                    className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10"
                  >
                    <option value="private">Gizli — sadece anı alanında</option>
                    <option value="public">Herkese açık — anma sayfasında</option>
                  </select>
                </div>
                <p className="text-xs text-[#adb5ab] pb-1">URL veya dosyadan en az biri zorunlu.</p>
              </div>

              <div>
                <label className={labelCls}>Video anlatımı <span className="text-[#dfbd72]">*</span></label>
                <textarea
                  name="caption"
                  rows={3}
                  required
                  minLength={3}
                  placeholder="Bu videoda kimler var, hangi an anlatılıyor?"
                  className={inputCls + ' resize-none'}
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors"
              >
                Videoyu Kaydet
              </button>
            </form>
          </div>
        )}

        {!videos?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] p-16 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-[#788177] text-sm">Henüz video eklenmemiş</p>
            <p className="text-xs text-[#adb5ab] mt-1">YouTube / Vimeo linki veya video dosyası ekleyin</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {videos.map((video) => {
              const embedUrl = getVideoEmbed(video.original_url)
              const del = deleteMediaAction.bind(null, id, video.id)
              return (
                <div key={video.id} className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden group hover:border-[#174f35]/20 transition-all">
                  {embedUrl ? (
                    <div className="aspect-video bg-[#f5efdf]">
                      <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={video.original_filename ?? 'Video'} />
                    </div>
                  ) : (
                    <div className="aspect-video bg-[#f5efdf] flex items-center justify-center">
                      <a
                        href={video.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 text-[#788177] hover:text-[#174f35] transition-colors"
                      >
                        <span className="text-4xl">▶️</span>
                        <span className="text-xs font-medium">Videoyu Aç</span>
                      </a>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#1f2d27] truncate flex-1">{video.original_filename ?? 'Video'}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${video.is_public ? 'bg-[#174f35]/10 text-[#174f35]' : 'bg-[#f5efdf] text-[#788177]'}`}>
                        {video.is_public ? 'Açık' : 'Gizli'}
                      </span>
                      {!isLocked && (
                        <form action={del}>
                          <button
                            type="submit"
                            className="text-[#e5dccb] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs font-medium"
                          >
                            Sil
                          </button>
                        </form>
                      )}
                    </div>
                    {video.taken_at && (
                      <p className="text-[11px] text-[#dfbd72] mt-1">
                        {new Date(video.taken_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                    {video.caption && (
                      <p className="text-xs text-[#788177] mt-1 line-clamp-2">{video.caption}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
