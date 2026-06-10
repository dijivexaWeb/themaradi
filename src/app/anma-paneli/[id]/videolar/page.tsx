import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addMemorialVideoAction } from '../actions'
import { updateMediaAction, deleteMediaAction } from '@/lib/actions/media'
import SubmitButton from '@/components/SubmitButton'
import VideoUploadForm from './VideoUploadForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

const VIDEO_LIMIT_MEMORIAL = 10

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0') + 'T' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0')
}

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export default async function MemorialVideolarPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type')
    .eq('id', id).eq('owner_id', user.id).eq('product_type', 'memorial_profile').single()
  if (!vault) notFound()

  const { data: videos } = await supabase
    .from('media').select('*')
    .eq('vault_id', id).eq('media_type', 'video')
    .order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const atLimit = (videos?.length ?? 0) >= VIDEO_LIMIT_MEMORIAL
  const addVideo = addMemorialVideoAction.bind(null, id)
  const returnPath = `/anma-paneli/${id}/videolar`

  const editingVideo = editId ? videos?.find((v) => v.id === editId) : null
  const todayMax = new Date().toISOString().slice(0, 16)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Videolar</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra video ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Videolar</h1>
            <p className="text-xs text-[#788177] mt-0.5">
              {videos?.length ?? 0} / {VIDEO_LIMIT_MEMORIAL} video
            </p>
          </div>
        </div>

        {/* Edit form */}
        {editingVideo && !isLocked && (
          <div className="rounded-3xl border border-[#c7a76f]/40 bg-[#fff9ee] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.08)] mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✏️</span>
                <h2 className="font-semibold text-[#1f2d27]">Videoyu Düzenle</h2>
              </div>
              <Link href={returnPath} className="text-xs text-[#788177] hover:text-[#174f35]">İptal</Link>
            </div>
            <p className="mb-4 text-xs text-[#788177]">Video kaynağı değiştirilemez. Değiştirmek için videoyu silip yeniden ekleyin.</p>
            <form action={updateMediaAction.bind(null, editingVideo.id, id, returnPath)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Başlık</label>
                  <input type="text" name="title" defaultValue={editingVideo.original_filename ?? ''} placeholder="Doğum günü videosu" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tarih</label>
                  <input type="datetime-local" name="taken_at" max={todayMax} defaultValue={toDatetimeLocal(editingVideo.taken_at)} className={inputCls} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Görünürlük</label>
                  <select name="visibility" defaultValue={editingVideo.is_public ? 'public' : 'private'}
                    className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                    <option value="private">Gizli</option>
                    <option value="public">Herkese açık</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Anlatım</label>
                  <input type="text" name="caption" defaultValue={(editingVideo as Record<string, unknown>).caption as string ?? ''} placeholder="Bu videoda kimler var?" className={inputCls} />
                </div>
              </div>
              <SubmitButton pendingLabel="Kaydediliyor...">Kaydet</SubmitButton>
            </form>
          </div>
        )}

        {/* Add form */}
        {!isLocked && !atLimit && !editingVideo && (
          <VideoUploadForm vaultId={id} todayMax={todayMax} />
        )}

        {atLimit && !isLocked && (
          <div className="mb-6 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Video limitine ulaştınız ({VIDEO_LIMIT_MEMORIAL} video). Yeni video eklemek için mevcut videolardan birini silin.
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
              const isEditing = video.id === editId
              return (
                <div key={video.id} className={`group rounded-2xl border bg-white overflow-hidden transition-all ${isEditing ? 'border-[#c7a76f]' : 'border-[#e5dccb] hover:border-[#174f35]/20 hover:shadow-md'}`}>
                  {embedUrl ? (
                    <div className="aspect-video bg-[#f5efdf]">
                      <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={video.original_filename ?? 'Video'} />
                    </div>
                  ) : (
                    <div className="aspect-video bg-black">
                      <video controls src={video.original_url} className="w-full h-full" preload="metadata" />
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
                        {(video as Record<string, unknown>).caption && (
                          <p className="text-xs text-[#788177] mt-1 line-clamp-2">{(video as Record<string, unknown>).caption as string}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${video.is_public ? 'bg-[#174f35]/10 text-[#174f35]' : 'bg-[#f5efdf] text-[#788177]'}`}>
                          {video.is_public ? 'Açık' : 'Gizli'}
                        </span>
                        {!isLocked && (
                          <div className="flex gap-1">
                            <Link
                              href={`${returnPath}?edit=${video.id}`}
                              className="text-xs font-medium text-[#174f35] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                            >Düzenle</Link>
                            <form action={del}>
                              <button type="submit" className="text-[#e5dccb] hover:text-red-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Sil
                              </button>
                            </form>
                          </div>
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
