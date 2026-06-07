import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'

interface Props { params: Promise<{ id: string }> }

const PHOTO_LIMIT_MEMORIAL = 50

export default async function FotolarPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name, status, product_type').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: photos } = await supabase
    .from('media')
    .select('*')
    .eq('vault_id', id)
    .eq('media_type', 'image')
    .order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const isMemorial = vault.product_type === 'memorial_profile'
  const limit = isMemorial ? PHOTO_LIMIT_MEMORIAL : Infinity
  const atLimit = (photos?.length ?? 0) >= limit

  async function addPhotoByUrl(formData: FormData) {
    'use server'
    const supabase2 = await createClient()
    const { data: { user: u } } = await supabase2.auth.getUser()
    if (!u) return

    const { data: v } = await supabase2.from('vaults').select('status, product_type').eq('id', id).eq('owner_id', u.id).single()
    if (!v || v.status === 'pending_verification') return

    const url = (formData.get('url') as string)?.trim()
    const title = (formData.get('title') as string)?.trim() || null
    if (!url) return

    const { count } = await supabase2.from('media').select('*', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'image')
    if (v.product_type === 'memorial_profile' && (count ?? 0) >= PHOTO_LIMIT_MEMORIAL) return

    await supabase2.from('media').insert({
      vault_id: id,
      uploader_id: u.id,
      original_url: url,
      thumb_url: url,
      media_type: 'image',
      is_public: true,
      original_filename: title ?? 'Fotoğraf',
    })

    revalidatePath(`/dashboard/vault/${id}/fotolar`)
    revalidatePath(`/dashboard/vault/${id}`)
  }

  async function deletePhoto(mediaId: string) {
    'use server'
    const supabase2 = await createClient()
    const { data: { user: u } } = await supabase2.auth.getUser()
    if (!u) return

    const { data: v } = await supabase2.from('vaults').select('id').eq('id', id).eq('owner_id', u.id).single()
    if (!v) return

    await supabase2.from('media').delete().eq('id', mediaId).eq('vault_id', id)
    revalidatePath(`/dashboard/vault/${id}/fotolar`)
    revalidatePath(`/dashboard/vault/${id}`)
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalarım</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Fotoğraflar</span>
        </div>

        {isLocked && (
          <div className="mb-5 bg-amber-900/20 border border-amber-500/30 text-amber-400 text-sm rounded-xl px-4 py-3">
            ⏳ Ödeme doğrulandıktan sonra fotoğraf ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Fotoğraflar</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {photos?.length ?? 0} / {isMemorial ? `${PHOTO_LIMIT_MEMORIAL}` : '∞'} fotoğraf
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 text-slate-400 text-xs px-3 py-2 rounded-lg">
            <span>📁</span>
            <span>Dosya yükleme yakında — şimdilik URL ile ekleyin</span>
          </div>
        </div>

        {!isLocked && !atLimit && (
          <div className="glass border border-slate-800/60 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">URL ile Fotoğraf Ekle</h2>
            <form action={addPhotoByUrl} className="flex gap-3 flex-wrap">
              <input type="url" name="url" required placeholder="https://resim-adresi.com/foto.jpg"
                className="flex-1 min-w-0 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              <input type="text" name="title" placeholder="Fotoğraf adı (opsiyonel)"
                className="w-48 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0">
                Ekle
              </button>
            </form>
          </div>
        )}

        {atLimit && !isLocked && (
          <div className="mb-5 bg-slate-800/40 border border-slate-700 text-slate-400 text-sm rounded-xl px-4 py-3">
            Fotoğraf limitine ulaştınız ({PHOTO_LIMIT_MEMORIAL}/{PHOTO_LIMIT_MEMORIAL})
          </div>
        )}

        {!photos?.length ? (
          <div className="glass border border-dashed border-slate-700 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-slate-400">Henüz fotoğraf eklenmemiş</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => {
              const del = deletePhoto.bind(null, photo.id)
              return (
                <div key={photo.id} className="glass border border-slate-800/60 rounded-xl overflow-hidden group hover:border-amber-500/30 transition-all">
                  <div className="aspect-square relative bg-slate-800">
                    <Image
                      src={photo.thumb_url ?? photo.original_url}
                      alt={photo.original_filename ?? 'Fotoğraf'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {!isLocked && (
                      <form action={del} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="submit" className="bg-red-500/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          ×
                        </button>
                      </form>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-slate-400 truncate">{photo.original_filename ?? 'Fotoğraf'}</p>
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
