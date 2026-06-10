import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { addMemorialAudioAction, updateMemorialAudioAction } from '../actions'
import { deleteAudioRecordingAction } from '@/lib/actions/audio'
import SubmitButton from '@/components/SubmitButton'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function MemorialSesKayitlariPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults')
    .select('id, display_name, status, product_type')
    .eq('id', id).eq('owner_id', user.id).eq('product_type', 'memorial_profile').single()
  if (!vault) notFound()

  const { data: recordings } = await supabase
    .from('vault_audio_recordings')
    .select('*')
    .eq('vault_id', id)
    .order('sort_order')

  const isLocked = vault.status === 'pending_verification'
  const addAction = addMemorialAudioAction.bind(null, id)
  const pageUrl = `/anma-paneli/${id}/ses-kayitlari`

  const editingRec = editId ? recordings?.find((r) => r.id === editId) : null

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Ses Kayıtları</span>
        </div>

        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">Ses Kayıtları</h1>
            <p className="text-xs text-[#788177] mt-0.5">{recordings?.length ?? 0} kayıt</p>
          </div>
        </div>

        {isLocked && (
          <div className="mb-6 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra kayıt ekleyebilirsiniz.
          </div>
        )}

        {/* Edit form */}
        {editingRec && !isLocked && (
          <div className="mb-6 rounded-3xl border border-[#c7a76f]/40 bg-[#fff9ee] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✏️</span>
                <h2 className="font-semibold text-[#1f2d27]">Kaydı Düzenle</h2>
              </div>
              <Link href={pageUrl} className="text-xs text-[#788177] hover:text-[#174f35]">İptal</Link>
            </div>
            <p className="mb-4 text-xs text-[#788177]">Ses dosyası değiştirilemez. Değiştirmek için kaydı silip yeniden yükleyin.</p>
            <audio controls src={editingRec.audio_url} className="mb-4 h-8 w-full" />
            <form action={updateMemorialAudioAction.bind(null, editingRec.id, id)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Başlık <span className="text-[#dfbd72]">*</span></label>
                  <input type="text" name="title" required defaultValue={editingRec.title} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Seslendiren</label>
                  <input type="text" name="author" defaultValue={editingRec.author ?? ''} placeholder="Kendi sesinden..." className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Görünürlük</label>
                <select name="is_public" defaultValue={editingRec.is_public ? 'true' : 'false'}
                  className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                  <option value="false">Gizli</option>
                  <option value="true">Herkese açık</option>
                </select>
              </div>
              <SubmitButton pendingLabel="Kaydediliyor...">Kaydet</SubmitButton>
            </form>
          </div>
        )}

        {/* Mevcut kayıtlar */}
        {(recordings?.length ?? 0) > 0 && (
          <div className="mb-6 rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-5 shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1f2d27]">
              <span>🎙️</span> Kayıtlar ({recordings!.length})
            </h2>
            <div className="space-y-3">
              {recordings!.map((rec) => {
                const isEditing = rec.id === editId
                return (
                  <div key={rec.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${isEditing ? 'border-[#c7a76f] bg-[#fff9ee]' : 'border-[#e5dccb] bg-white'}`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174f35]/10 text-[#174f35]">
                      🎵
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#1f2d27]">{rec.title}</div>
                      {rec.author && <div className="text-xs text-[#788177]">{rec.author}</div>}
                      <div className="mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${rec.is_public ? 'bg-[#174f35]/10 text-[#174f35]' : 'bg-[#f5efdf] text-[#788177]'}`}>
                          {rec.is_public ? 'Herkese açık' : 'Gizli'}
                        </span>
                      </div>
                      <audio controls src={rec.audio_url} className="mt-2 h-8 w-full" />
                    </div>
                    {!isLocked && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link
                          href={`${pageUrl}?edit=${rec.id}`}
                          className="rounded-lg border border-[#e5dccb] bg-white px-3 py-1.5 text-xs font-medium text-[#174f35] transition hover:bg-[#f5efdf] text-center"
                        >
                          Düzenle
                        </Link>
                        <form action={deleteAudioRecordingAction.bind(null, rec.id, id)}>
                          <button type="submit" className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                            Sil
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Yeni kayıt ekle */}
        {!editingRec && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.05)]">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1f2d27]">
              <span>➕</span> Yeni Ses Kaydı Ekle
            </h2>
            <form action={addAction} className="space-y-4">
              <div>
                <label className={labelCls}>Başlık <span className="text-[#dfbd72]">*</span></label>
                <input type="text" name="title" required placeholder="Sabah duası, Son mesajı, Şiir okuması..." disabled={isLocked} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Seslendiren</label>
                <input type="text" name="author" placeholder="Kendi sesinden, Kızı Zeynep anlatıyor..." disabled={isLocked} className={inputCls} />
              </div>
              <div className="rounded-2xl border border-[#e5dccb] bg-white p-4 space-y-3">
                <div>
                  <label className={labelCls}>Ses dosyası yükle</label>
                  <input type="file" name="audio_file" accept="audio/*" disabled={isLocked}
                    className="w-full cursor-pointer rounded-xl border border-[#e5dccb] bg-white px-3 py-2.5 text-sm text-[#1f2d27] file:mr-3 file:rounded-lg file:border-0 file:bg-[#174f35]/10 file:px-3 file:py-1.5 file:text-[#174f35] file:font-medium outline-none disabled:opacity-40" />
                </div>
                <p className="text-[11px] text-[#adb5ab]">veya</p>
                <div>
                  <label className={labelCls}>Ses URL</label>
                  <input type="url" name="audio_url" placeholder="https://... (mp3, wav, ogg)" disabled={isLocked} className={inputCls} />
                </div>
              </div>
              {!isLocked && (
                <SubmitButton
                  className="w-full rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  pendingLabel="Yükleniyor..."
                >
                  Kaydet
                </SubmitButton>
              )}
            </form>
          </div>
        )}

        {!recordings?.length && !editingRec && (
          <div className="mt-6 rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-14 text-center">
            <p className="text-5xl mb-3">🎙️</p>
            <p className="font-serif text-lg text-[#1f2d27] mb-1">Henüz ses kaydı yok</p>
            <p className="text-sm text-[#788177]">Anma sayfasında çalınacak ses dosyası ekleyin.</p>
          </div>
        )}
      </div>
    </div>
  )
}
