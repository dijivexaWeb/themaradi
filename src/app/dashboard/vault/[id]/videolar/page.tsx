import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addVideoAction, deleteMediaAction } from '@/lib/actions/media'
import PersonHeader from '../_PersonHeader'

interface Props { params: Promise<{ id: string }> }

const VIDEO_LIMIT_MEMORIAL = 10

export default async function VideolarPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: videos } = await supabase
    .from('media').select('*')
    .eq('vault_id', id).eq('media_type', 'video')
    .order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const isMemorial = vault.product_type === 'memorial_profile'
  const atLimit = isMemorial && (videos?.length ?? 0) >= VIDEO_LIMIT_MEMORIAL
  const addVideo = addVideoAction.bind(null, id)

  function getVideoEmbed(url: string): string | null {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    const vimeo = url.match(/vimeo\.com\/(\d+)/)
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
    return null
  }

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Videolar</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Videolar" sectionIcon="🎬" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra video ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Videolar</h1>
            <p className="text-xs text-[#788177] mt-0.5">
              {videos?.length ?? 0}{isMemorial ? ` / ${VIDEO_LIMIT_MEMORIAL}` : ''} video
            </p>
          </div>
        </div>

        {!isLocked && !atLimit && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📤</span>
              <h2 className="font-semibold text-[#1f2d27]">Video Ekle</h2>
            </div>
            <p className="text-xs text-[#788177] mb-4 ml-7">YouTube / Vimeo linki, video URL'si veya dosya yükleme</p>
            <form action={addVideo} encType="multipart/form-data" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Video URL</label>
                  <input type="url" name="url" placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Dosya Yükle</label>
                  <input type="file" name="file" accept="video/*"
                    className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Başlık</label>
                  <input type="text" name="title" placeholder="Doğum günü videosu" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tarih <span className="text-[#dfbd72]">*</span></label>
                  <input type="datetime-local" name="taken_at" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Görünürlük <span className="text-[#dfbd72]">*</span></label>
                  <select name="visibility" required defaultValue="private"
                    className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                    <option value="private">Gizli</option>
                    <option value="public">Herkese açık</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Anlatım <span className="text-[#dfbd72]">*</span></label>
                <textarea name="caption" rows={2} required minLength={3}
                  placeholder="Bu videoda kimler var, hangi an anlatılıyor?"
                  className={inputCls + ' resize-none'} />
              </div>
              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Videoyu Kaydet
              </button>
            </form>
          </div>
        )}

        {!videos?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="text-6xl mb-4">🎬</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">Henüz video yok</p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">YouTube, Vimeo linki ekleyin ya da video dosyası yükleyin.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {videos.map((video) => {
              const embedUrl = getVideoEmbed(video.original_url)
              const del = deleteMediaAction.bind(null, id, video.id)
              return (
                <div key={video.id} className="group rounded-2xl border border-[#e5dccb] bg-white overflow-hidden hover:border-[#174f35]/20 hover:shadow-md transition-all">
                  {embedUrl ? (
                    <div className="aspect-video bg-[#f5efdf]">
                      <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={video.original_filename ?? 'Video'} />
                    </div>
                  ) : (
                    <div className="aspect-video bg-[#f5efdf] flex flex-col items-center justify-center gap-2">
                      <span className="text-4xl">▶️</span>
                      <a href={video.original_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-[#174f35] hover:underline">Videoyu Aç →</a>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#1f2d27] text-sm truncate">{video.original_filename ?? 'Video'}</p>
                        {video.taken_at && (
                          <p className="text-[11px] text-[#dfbd72] mt-0.5">
                            {new Date(video.taken_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        )}
                        {video.caption && (
                          <p className="text-xs text-[#788177] mt-1 line-clamp-2">{video.caption}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${video.is_public ? 'bg-[#174f35]/10 text-[#174f35]' : 'bg-[#f5efdf] text-[#788177]'}`}>
                          {video.is_public ? 'Açık' : 'Gizli'}
                        </span>
                        {!isLocked && (
                          <form action={del}>
                            <button type="submit"
                              className="text-[#e5dccb] hover:text-red-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Sil
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
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
