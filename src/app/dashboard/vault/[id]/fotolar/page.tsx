import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { addPhotoAction, deleteMediaAction } from '@/lib/actions/media'

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
  const addPhoto = addPhotoAction.bind(null, id)

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Fotoğraflar</span>
        </div>

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra fotoğraf ekleyebilirsiniz.
          </div>
        )}

        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Fotoğraflar</h1>
            <p className="text-xs text-[#788177] mt-0.5">
              {photos?.length ?? 0} / {isMemorial ? PHOTO_LIMIT_MEMORIAL : '∞'} fotoğraf
            </p>
          </div>
        </div>

        {!isLocked && !atLimit && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_16px_50px_rgba(64,48,24,0.06)] mb-8">
            <h2 className="text-sm font-semibold text-[#1f2d27] mb-4">Fotoğraf Ekle</h2>
            <form action={addPhoto} className="space-y-4" encType="multipart/form-data">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Dosya Yükle</label>
                  <input
                    type="file"
                    name="file"
                    accept="image/*"
                    className="w-full rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className={labelCls}>veya Fotoğraf URL</label>
                  <input type="url" name="url" placeholder="https://resim-adresi.com/foto.jpg" className={inputCls} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fotoğraf adı</label>
                  <input type="text" name="title" placeholder="Piknik fotoğrafı" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Çekildiği tarih ve saat <span className="text-[#dfbd72]">*</span></label>
                  <input type="datetime-local" name="taken_at" required className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Fotoğraf notu <span className="text-[#dfbd72]">*</span></label>
                <textarea
                  name="caption"
                  required
                  rows={3}
                  minLength={3}
                  placeholder="Örn. Bu piknikte aile ilk kez Borjomi'de bir araya gelmişti..."
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div className="flex items-end gap-4 flex-wrap">
                <div className="flex-1 min-w-48">
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
                <button
                  type="submit"
                  className="rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors"
                >
                  Fotoğrafı Kaydet
                </button>
              </div>
              <p className="text-xs text-[#adb5ab]">URL veya dosyadan en az biri zorunlu. Tarih ve not olmadan fotoğraf kaydedilmez.</p>
            </form>
          </div>
        )}

        {atLimit && !isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Fotoğraf limitine ulaştınız ({PHOTO_LIMIT_MEMORIAL}/{PHOTO_LIMIT_MEMORIAL})
          </div>
        )}

        {!photos?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] p-16 text-center">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-[#788177] text-sm">Henüz fotoğraf eklenmemiş</p>
            <p className="text-xs text-[#adb5ab] mt-1">Yukarıdaki formdan fotoğraf yükleyin veya URL girin</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => {
              const del = deleteMediaAction.bind(null, id, photo.id)
              return (
                <div
                  key={photo.id}
                  className="rounded-2xl border border-[#e5dccb] bg-white overflow-hidden group hover:border-[#174f35]/30 hover:shadow-md transition-all"
                >
                  <div className="aspect-square relative bg-[#f5efdf]">
                    <Image
                      src={photo.thumb_url ?? photo.original_url}
                      alt={photo.original_filename ?? 'Fotoğraf'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {!isLocked && (
                      <form action={del} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="submit"
                          className="bg-white/90 hover:bg-red-50 border border-red-200 text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm"
                        >
                          ×
                        </button>
                      </form>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-[#1f2d27] font-medium truncate">{photo.original_filename ?? 'Fotoğraf'}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${photo.is_public ? 'bg-[#174f35]/10 text-[#174f35]' : 'bg-[#f5efdf] text-[#788177]'}`}>
                        {photo.is_public ? 'Açık' : 'Gizli'}
                      </span>
                    </div>
                    {photo.taken_at && (
                      <p className="text-[11px] text-[#dfbd72]">
                        {new Date(photo.taken_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                    {photo.caption && (
                      <p className="text-xs text-[#788177] line-clamp-2">{photo.caption}</p>
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
