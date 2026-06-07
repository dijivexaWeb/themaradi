import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

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

  async function addVideo(formData: FormData) {
    'use server'
    const supabase2 = await createClient()
    const { data: { user: u } } = await supabase2.auth.getUser()
    if (!u) return

    const { data: v } = await supabase2.from('vaults').select('status, product_type').eq('id', id).eq('owner_id', u.id).single()
    if (!v || v.status === 'pending_verification') return

    const url = (formData.get('url') as string)?.trim()
    const title = (formData.get('title') as string)?.trim() || null
    if (!url) return

    const { count } = await supabase2.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'video')
    if (v.product_type === 'memorial_profile' && (count ?? 0) >= VIDEO_LIMIT_MEMORIAL) return

    await supabase2.from('media').insert({
      vault_id: id,
      uploader_id: u.id,
      original_url: url,
      media_type: 'video',
      is_public: true,
      original_filename: title ?? 'Video',
    })

    revalidatePath(`/dashboard/vault/${id}/videolar`)
    revalidatePath(`/dashboard/vault/${id}`)
  }

  async function deleteVideo(mediaId: string) {
    'use server'
    const supabase2 = await createClient()
    const { data: { user: u } } = await supabase2.auth.getUser()
    if (!u) return
    const { data: v } = await supabase2.from('vaults').select('id').eq('id', id).eq('owner_id', u.id).single()
    if (!v) return
    await supabase2.from('media').delete().eq('id', mediaId).eq('vault_id', id)
    revalidatePath(`/dashboard/vault/${id}/videolar`)
  }

  function getVideoEmbed(url: string): string | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    return null
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalarım</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Videolar</span>
        </div>

        {isLocked && (
          <div className="mb-5 bg-amber-900/20 border border-amber-500/30 text-amber-400 text-sm rounded-xl px-4 py-3">
            ⏳ Ödeme doğrulandıktan sonra video ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Videolar</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {videos?.length ?? 0} / {isMemorial ? VIDEO_LIMIT_MEMORIAL : '∞'} video
            </p>
          </div>
        </div>

        {!isLocked && !atLimit && (
          <div className="glass border border-slate-800/60 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-1">Video Ekle</h2>
            <p className="text-xs text-slate-500 mb-3">YouTube, Vimeo veya direkt video URL'si ekleyin</p>
            <form action={addVideo} className="flex gap-3 flex-wrap">
              <input type="url" name="url" required placeholder="https://youtube.com/watch?v=..."
                className="flex-1 min-w-0 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              <input type="text" name="title" placeholder="Video başlığı"
                className="w-48 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0">
                Ekle
              </button>
            </form>
          </div>
        )}

        {!videos?.length ? (
          <div className="glass border border-dashed border-slate-700 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-slate-400">Henüz video eklenmemiş</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {videos.map((video) => {
              const embedUrl = getVideoEmbed(video.original_url)
              const del = deleteVideo.bind(null, video.id)
              return (
                <div key={video.id} className="glass border border-slate-800/60 rounded-2xl overflow-hidden group">
                  {embedUrl ? (
                    <div className="aspect-video bg-slate-900">
                      <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={video.original_filename ?? 'Video'} />
                    </div>
                  ) : (
                    <div className="aspect-video bg-slate-800 flex items-center justify-center">
                      <a href={video.original_url} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors">
                        <span className="text-4xl">▶️</span>
                        <span className="text-xs">Videoyu Aç</span>
                      </a>
                    </div>
                  )}
                  <div className="p-3 flex items-center justify-between">
                    <p className="text-sm text-slate-300 truncate flex-1">{video.original_filename ?? 'Video'}</p>
                    {!isLocked && (
                      <form action={del}>
                        <button type="submit" className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs ml-3">Sil</button>
                      </form>
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
