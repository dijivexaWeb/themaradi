import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { addPhotoAction, deleteMediaAction } from '@/lib/actions/media'
import PersonHeader from '../_PersonHeader'

interface Props { params: Promise<{ id: string }> }

const PHOTO_LIMIT_MEMORIAL = 50

export default async function FotolarPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: photos } = await supabase
    .from('media').select('*')
    .eq('vault_id', id).eq('media_type', 'image')
    .order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const isMemorial = vault.product_type === 'memorial_profile'
  const atLimit = (photos?.length ?? 0) >= (isMemorial ? PHOTO_LIMIT_MEMORIAL : Infinity)
  const addPhoto = addPhotoAction.bind(null, id)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Fotoğraflar</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Fotoğraflar" sectionIcon="📷" />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra fotoğraf ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Fotoğraflar</h1>
            <p className="text-xs text-[#788177] mt-0.5">
              {photos?.length ?? 0}{isMemorial ? ` / ${PHOTO_LIMIT_MEMORIAL}` : ''} fotoğraf
            </p>
          </div>
        </div>

        {/* Upload form */}
        {!isLocked && !atLimit && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)] mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📤</span>
              <h2 className="font-semibold text-[#1f2d27]">Fotoğraf Ekle</h2>
            </div>
            <form action={addPhoto} encType="multipart/form-data" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Dosya Yükle</label>
                  <input type="file" name="file" accept="image/*"
                    className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none" />
                </div>
                <div>
                  <label className={labelCls}>veya URL</label>
                  <input type="url" name="url" placeholder="https://..." className={inputCls} />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Fotoğraf adı</label>
                  <input type="text" name="title" placeholder="Piknik, 1985" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Çekildiği tarih <span className="text-[#dfbd72]">*</span></label>
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
                <label className={labelCls}>Not <span className="text-[#dfbd72]">*</span></label>
                <textarea name="caption" required rows={2} minLength={3}
                  placeholder="Bu fotoğraf hakkında birkaç kelime..."
                  className={inputCls + ' resize-none'} />
              </div>
              <button type="submit"
                className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                Fotoğrafı Kaydet
              </button>
            </form>
          </div>
        )}

        {atLimit && !isLocked && (
          <div className="mb-6 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Fotoğraf limitine ulaştınız ({PHOTO_LIMIT_MEMORIAL}/{PHOTO_LIMIT_MEMORIAL})
          </div>
        )}

        {/* Masonry galeri */}
        {!photos?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="text-6xl mb-4">📷</p>
            <p className="font-serif text-xl text-[#1f2d27] mb-1">Henüz fotoğraf yok</p>
            <p className="text-sm text-[#788177] max-w-xs mx-auto">Önemli anları yükleyin. Fotoğraflar anma sayfasında görünür.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {photos.map((photo) => {
              const del = deleteMediaAction.bind(null, id, photo.id)
              return (
                <div key={photo.id} className="break-inside-avoid mb-3 group relative rounded-2xl overflow-hidden border border-[#e5dccb] bg-white hover:shadow-md hover:border-[#174f35]/20 transition-all">
                  <Image
                    src={photo.thumb_url ?? photo.original_url}
                    alt={photo.original_filename ?? 'Fotoğraf'}
                    width={0}
                    height={0}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ width: '100%', height: 'auto' }}
                    unoptimized
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${photo.is_public ? 'bg-[#174f35] text-white' : 'bg-black/50 text-white'}`}>
                      {photo.is_public ? 'Açık' : 'Gizli'}
                    </span>
                  </div>

                  {/* Delete */}
                  {!isLocked && (
                    <form action={del} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="submit" className="h-6 w-6 rounded-full bg-white/90 text-red-500 hover:bg-red-50 border border-red-200 text-xs font-bold shadow-sm">
                        ×
                      </button>
                    </form>
                  )}

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.taken_at && (
                      <p className="text-[10px] text-white/80 mb-0.5">
                        {new Date(photo.taken_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}
                    {photo.caption && (
                      <p className="text-xs text-white line-clamp-2 leading-4">{photo.caption}</p>
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
